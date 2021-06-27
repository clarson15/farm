from gpiozero import LED
import datetime
import os
from mysql.connector import connect, Error
LOGDebug = 0
LOGWarning = 1
LOGError = 2

mysqlpass = os.environ['pass']
led = LED(17)
try:
    with connect(
        host="localhost",
        user="root",
        password=mysqlpass,
        database="farm"
    ) as connection:
        print(connection)
except Error as e:
    print(e)
    exit()


def Log(level, message):
    sql = "INSERT INTO logs (level, message, at) VALUES (" + level + ", " + \
        message + ", " + datetime.datetime.now().strftime("%m/%d/%Y %H:%M:%S") + ");"
    with connection.cursor() as cursor:
        cursor.execute(sql)
        connection.commit()


def Loop():
    Log(LOGDebug, "Testing connection and commit")
    exit()
