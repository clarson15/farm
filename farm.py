from gpiozer import LED
from time import sleep
import os
import mysql.connector

mysqlpass = os.environ['pass']
led = LED(17)
