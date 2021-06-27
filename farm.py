from gpiozero import LED
import datetime
import os
from mysql.connector import connect, Error
LOGDebug = 0
LOGWarning = 1
LOGError = 2

mysqlpass = os.environ['pass']

led = LED(17)
dbConnection = connect(host="127.0.0.1", user="pi", password=mysqlpass, db="farm")


def Log(level, message):
    sql = "INSERT INTO logs (level, message, at) VALUES (" + str(level) + ", \"" + \
        message + "\", \"" + datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S") + "\");"
    print(sql)
    with dbConnection.cursor() as cursor:
        cursor.execute(sql)
        dbConnection.commit()


def Loop():
    Log(LOGDebug, "Testing connection and commit")
    exit()

Loop()
