from gpiozero import LED
from datetime import datetime
import time
import os
from mysql.connector import connect
import constants

def LoadSchedule():
    sql = "SELECT at, enabled FROM schedule ORDER BY at"
    print(sql)
    global schedule
    schedule = []
    with dbConnection.cursor() as cursor:
        cursor.execute(sql)
        midnight = datetime.combine(datetime.today(), datetime.min.time())
        for (at, enabled) in cursor:
            scheduleEvent = {'at': midnight + at, 'enabled': enabled}
            print(scheduleEvent)
            schedule.append(scheduleEvent)


def GetLightState() -> bool:
    LoadSchedule()
    current_time = datetime.now()
    if len(schedule) == 0:
        print("No schedule found.")
        return 0
    for i in range(len(schedule) - 1):
        if(schedule[i]['at'] < current_time and schedule[i+1]['at'] > current_time):
            print("Using schedule event " + str(i))
            return schedule[i]['enabled']
    print("Using last schedule event")
    return schedule[len(schedule) - 1]['enabled']


def Setup():
    mysqlpass = os.environ['pass']
    global power
    global dbConnection
    global schedule
    schedule = []
    power = LED(17)
    dbConnection = connect(host="127.0.0.1", user="pi",
                           password=mysqlpass, db="farm")
    Log(constants.DEBUG, "Project starting up")


def Log(level, message):
    sql = "INSERT INTO logs (level, message, at) VALUES (" + str(level) + ", \"" + \
        message + "\", \"" + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + "\");"
    print(sql)
    with dbConnection.cursor() as cursor:
        cursor.execute(sql)
        dbConnection.commit()


def Loop():
    while True:
        state = GetLightState()
        if (state and not power.is_lit):
            Log(constants.DEBUG, "Turning lights on")
            power.on()
        elif (not state and power.is_lit):
            Log(constants.DEBUG, "Turning lights off")
            power.off()
        time.sleep(60)

try:
    Setup()
    Loop()
except BaseException as e:
    print(e)
    if(dbConnection.is_connected()):
        Log(constants.DEBUG, "Shutting down...")
        Log(constants.ERROR, str(e)[-1024:])
