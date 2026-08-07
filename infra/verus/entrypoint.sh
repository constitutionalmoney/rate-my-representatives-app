#!/bin/sh
set -eu

chown -R verus:verus /var/lib/verus /home/verus/.zcash-params /run/verus

if [ "${1:-}" = "fetch-params" ]; then
  exec gosu verus /opt/verus/fetch-params
fi

if [ "${VERUS_NETWORK:-}" != "VRSCTEST" ]; then
  echo "The local profile only permits VERUS_NETWORK=VRSCTEST." >&2
  exit 64
fi

rpc_user="$(cat /run/secrets/verus_rpc_user)"
rpc_password="$(cat /run/secrets/verus_rpc_password)"
cat > /run/verus/verus.conf <<EOF
server=1
listen=1
rpcbind=0.0.0.0
rpcallowip=127.0.0.1
rpcallowip=172.30.90.0/24
rpcport=27486
rpcuser=${rpc_user}
rpcpassword=${rpc_password}
EOF
chown verus:verus /run/verus/verus.conf
chmod 0600 /run/verus/verus.conf

exec gosu verus /opt/verus/verusd \
  -chain=VRSCTEST \
  -conf=/run/verus/verus.conf \
  -datadir=/var/lib/verus \
  -printtoconsole=1
