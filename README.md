# PiFarm

PiFarm is a personal project I created to use a Raspberry Pi to automate an indoor garden/growbox. Easily customizable through the included web server, and I've included chartjs to view data logged from supported sensors.

## Features

- Turn lights on/off at specific times every day
- Log temperature and humidity every 10 minutes
- Webserver to customize behavior
- Charts to view environment sensor readings
- Log viewer to troubleshoot if something goes wrong

## Tech

- [Angular]
- [Node.js] 
- [Chart.js]
- [Express]
- [Bootstrap]
- [Python]
- [MariaDB]
- [Typescript]

## Installation

### Clone Repository
(while logged in as pi)
```
cd ~
git clone git@github.com:clarson15/farm.git
```

### Enable I2C interface
```
sudo raspi-config
```
(5) Interface Options -> (P5) I2C

### Install [Python]
```
sudo apt-get install python3
pip install gpiozero smbus mysql-connector-python
sudo apt-get install python3-smbus
```

### Install [Node.js]
Replace 16 with latest major version of Node
```
curl -sL https://deb.nodesource.com/setup_16.x | sudo bash -
```
#### Raspberry Pi Zero, Zero W, and Raspberry Pi 1:
Find the latest version of node from https://unofficial-builds.nodejs.org/download/release (my example is v16.4.2)
```
curl -o node-v16.4.2-linux-armv6l.tar.gz https://unofficial-builds.nodejs.org/download/release/v16.4.2/node-v16.4.2-linux-armv6l.tar.gz
tar -xzf node-v16.4.2-linux-armv6l.tar.gz
sudo cp -r node-v16.4.2-linux-armv6l/* /usr/local
rm -rf node-v16.4.2-linux-armv6l*
```

### Install [MariaDB]
```
sudo apt-get install mariadb
sudo mysql_secure_installation
```
Press enter (no root password set)
Then hit "Y" to set a new password, then enter that password
then press "Y" 4 more times for default security settings and to reload the privileges
#### Setup default user
```
sudo mysql -u root -p
{enter your root password you just created}
USE mysql;
CREATE USER 'pi'@'localhost' IDENTIFIED WITH mysql_native_password BY 'YOUR PASSWORD';
GRANT ALL PRIVILEGES ON *.* TO 'pi'@'localhost';
FLUSH PRIVILEGES;
```

#### Setup database schema
```
CREATE DATABASE farm;
CREATE TABLE schedule(id INT PRIMARY KEY AUTO_INCREMENT, at TIME NOT NULL, enabled BOOLEAN NOT NULL);
CREATE TABLE logs(id INT PRIMARY KEY AUTO_INCREMENT, message VARCHAR(1024) NOT NULL, at DATETIME NOT NULL, level TINYINT UNSIGNED NOT NULL);
CREATE TABLE readings(id INT PRIMARY KEY AUTO_INCREMENT, humidity decimal(5,2) NOT NULL, temperature decimal(5, 2) NOT NULL, at DATETIME NOT NULL);
```

### Create Systemd services
These service files will start the project on startup and restart the crashed services if something goes wrong.

edit line 9 of docs/farm.service and docs/webfarm.service to set your password for the default mysql user you created in a previous step
```
Environment="pass=your_password"
```

```
sudo cp ~/farm/docs/farm.service /etc/systemd/system/farm.service
sudo cp ~/farm/docs/webfarm.service /etc/systemd/system/webfarm.service
sudo chmod 644 /etc/systemd/system/farm.service
sudo chmod 644 /etc/systemd/system/webfarm.service
sudo systemctl enable farm.service
sudo systemctl enable webfarm.service
```

### Reboot Pi
```
sudo reboot
```

## Todo

General:
- Split graph into multiple graphs
- Rewrite python script in javascript
- Remove TCP socket communication between services
- Optimize python schedule code to not query DB every second

Configuration Page:
- Add support for multiple environment sensors
- Add support for pumps
- Add support for fans
- Add support for multiple light pins



## License
MIT

   [Angular]: <https://angular.io/>
   [Node.js]: <http://nodejs.org/>
   [Bootstrap]: <https://getbootstrap.com/>
   [Express]: <http://expressjs.com/>
   [Chart.js]: <https://www.chartjs.org/>
   [Python]: <https://www.python.org/>
   [MariaDB]: <https://mariadb.org/>
   [Typescript]: <https://www.typescriptlang.org/>
