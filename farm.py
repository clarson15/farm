from gpiozero import LED
from datetime import datetime
import time
import os
from mysql.connector import connect
import constants

schedule = []


def LoadSchedule():
    sql = "SELECT * FROM schedule ORDER BY at"
    print(sql)
    schedule = []
    with dbConnection.cursor() as cursor:
        cursor.execute(sql)
        for (at, enabled) in cursor:
            schedule.append({'at': datetime.strptime(
                at, '%H:%M:%S'), 'enabled': enabled})


def GetLightState() -> bool:
    current_time = datetime.now()
    for eventTime in schedule:
        eventTime['at'].year = current_time.year
        eventTime['at'].month = current_time.month
        eventTime['at'].day = current_time.day
    if len(schedule) == 0:
        return False
    for i in range(len(schedule) - 1):
        if(schedule[i]['at'] < current_time and schedule[i+1]['at'] > current_time):
            return schedule[i]['enabled']
    return schedule[len(schedule) - 1]['enabled']


def Setup():
    mysqlpass = os.environ['pass']
    global power
    global dbConnection
    power = LED(17)
    dbConnection = connect(host="127.0.0.1", user="pi",
                           password=mysqlpass, db="farm")
    Log(constants.DEBUG, "Project starting up")


def Log(level, message):
    sql = "INSERT INTO logs (level, message, at) VALUES (" + str(level) + ", \"" + \
        message + "\", \"" + datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S") + "\");"
    print(sql)
    with dbConnection.cursor() as cursor:
        cursor.execute(sql)
        dbConnection.commit()


def Loop():
    LoadSchedule()
    print(GetLightState())
    time.sleep(5)


Setup()
Loop()
