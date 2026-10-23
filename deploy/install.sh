#!/usr/bin/env bash
# zzsoq.com 一键部署：在 VPS 上、仓库目录里以 root 运行
#   bash deploy/install.sh 你的邮箱
# 会做：装 nginx + certbot → 把网站放到 /var/www/zzsoq.com → 启用 nginx 配置 → 放行防火墙 → 申请 HTTPS 证书
# 可重复运行；以后更新网站：cd /var/www/zzsoq.com && git pull
set -euo pipefail

DOMAIN=zzsoq.com
WEBROOT=/var/www/zzsoq.com
EMAIL="${1:-}"
SRC="$(cd "$(dirname "$0")/.." && pwd)"

say()  { printf '\n\033[1;35m==> %s\033[0m\n' "$*"; }
fail() { printf '\n\033[1;31m✗ %s\033[0m\n' "$*"; exit 1; }

[ "$(id -u)" = 0 ] || fail "请用 root 运行（前面加 sudo）"
[ -n "$EMAIL" ] || fail "用法：bash deploy/install.sh 你的邮箱   （邮箱用于 HTTPS 证书到期提醒）"

say "1/6 安装 nginx、git、certbot"
if command -v apt-get >/dev/null; then
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y nginx git certbot python3-certbot-nginx curl
elif command -v dnf >/dev/null; then
  dnf install -y epel-release || true
  dnf install -y nginx git certbot python3-certbot-nginx curl
elif command -v yum >/dev/null; then
  yum install -y epel-release || true
  yum install -y nginx git certbot python3-certbot-nginx curl
else
  fail "没识别出系统的包管理器（支持 Ubuntu / Debian / CentOS / Rocky / Alma）"
fi
systemctl enable --now nginx

say "2/6 放置网站文件到 $WEBROOT"
if [ "$SRC" != "$WEBROOT" ]; then
  mkdir -p "$(dirname "$WEBROOT")"
  if [ -d "$WEBROOT/.git" ]; then
    git -C "$WEBROOT" pull --ff-only
  else
    # 保留已经上传过的音乐和照片
    [ -d "$WEBROOT" ] && mv "$WEBROOT" "$WEBROOT.bak.$(date +%s)"
    cp -a "$SRC" "$WEBROOT"
    for d in music photos; do
      last=$(ls -d "$WEBROOT".bak.* 2>/dev/null | tail -1 || true)
      [ -n "$last" ] && [ -d "$last/$d" ] && cp -an "$last/$d/." "$WEBROOT/$d/" || true
    done
  fi
fi
chmod -R a+rX "$WEBROOT"
command -v restorecon >/dev/null && restorecon -R "$WEBROOT" || true   # SELinux 系统

say "3/6 启用 nginx 配置"
mkdir -p /etc/nginx/conf.d
cp "$WEBROOT/deploy/nginx.conf" /etc/nginx/conf.d/zzsoq.com.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

say "4/6 放行 80 / 443 端口"
if command -v ufw >/dev/null && ufw status | grep -q active; then ufw allow 80/tcp; ufw allow 443/tcp; fi
if command -v firewall-cmd >/dev/null && firewall-cmd --state >/dev/null 2>&1; then
  firewall-cmd --permanent --add-service=http --add-service=https; firewall-cmd --reload
fi
echo "（云服务器还需要在厂商控制台的『安全组』里放行 80 和 443）"

say "5/6 检查域名解析"
MYIP=$(curl -4 -s --max-time 8 https://api.ipify.org || curl -4 -s --max-time 8 https://ifconfig.me || echo "?")
echo "本机公网 IP：$MYIP"
for h in "$DOMAIN" "www.$DOMAIN"; do
  ip=$(getent ahostsv4 "$h" | awk 'NR==1{print $1}')
  echo "$h → ${ip:-（解析不到）}"
  [ "${ip:-}" = "$MYIP" ] || echo "  ⚠ 与本机 IP 不一致：如果刚改过 DNS，等几分钟再运行一次本脚本"
done

say "6/6 申请 HTTPS 证书（Let's Encrypt，自动续期）"
if certbot --nginx -n --agree-tos -m "$EMAIL" --redirect -d "$DOMAIN" -d "www.$DOMAIN"; then
  say "完成！打开 https://$DOMAIN"
else
  echo
  echo "HTTPS 证书没申请成功，网站已经可以用 http://$DOMAIN 打开。常见原因："
  echo "  · 域名还没解析到本机（看上面第 5 步）"
  echo "  · 云厂商安全组没放行 80 端口"
  echo "  · 服务器在中国大陆且域名未备案（80 端口会被拦截）"
  echo "解决后重新运行：bash $WEBROOT/deploy/install.sh $EMAIL"
fi
