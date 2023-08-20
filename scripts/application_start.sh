sudo chmod -R 777 /home/ec2-user/pinterest_like

cd /home/ec2-user/pinterest_like

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

npm install
npm i pm2 -g
pm2 kill
pm2 start dist/bundle.js -f --name=server