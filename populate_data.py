import random
from datetime import datetime, timedelta
import os
import string
from mysql.connector import connect


def Setup():
    global cTemp
    global humidity
    global currentDate
    global dbConnection
    currentDate = datetime.now() + timedelta(days=-2)
    cTemp = 25.5
    humidity = 60.24
    mysqlpass = os.environ['pass']
    dbConnection = connect(host="127.0.0.1", user="pi",
                           password=mysqlpass, db="farm")


def SaveTempAndHumidity():
    global cTemp
    global humidity
    global currentDate
    cTemp = max(min(cTemp + (random.random() - 0.5), 35), 20)
    humidity = max(min(humidity + (random.random() * 10) - 5, 100), 0)
    sql = "INSERT INTO readings (humidity, temperature, at) VALUES (%.2f, %.2f, \"%s\")" % (
        humidity, cTemp, currentDate.strftime("%Y-%m-%d %H:%M:%S"))
    print(sql)
    with dbConnection.cursor() as cursor:
        cursor.execute(sql)
        dbConnection.commit()
    currentDate = currentDate + timedelta(minutes=10)


def Log(level, message):
    sql = "INSERT INTO logs (level, message, at) VALUES ( %d, \"%s\", \"%s\")" % (
        level, message, currentDate.strftime("%Y-%m-%d %H:%M:%S"))
    print(sql)
    with dbConnection.cursor() as cursor:
        cursor.execute(sql)
        dbConnection.commit()


Setup()
for i in range(0, 100):
    SaveTempAndHumidity()

currentDate = datetime.now() + timedelta(days=-2)

for i in range(0, 100):
    message = ''
    currentDate += timedelta(minutes=random.random())
    for i in range(random.randint(50, 1024)):
        message += random.choice(string.ascii_letters)
    Log(random.randint(0, 2), message)
