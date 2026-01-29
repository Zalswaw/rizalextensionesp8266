/**
 * Firebase Realtime Database - SIMPLE MODE
 * No API Key
 * No Auth
 * Public Database Only
 * For ESP8266 + MakeCode
 */

namespace esp8266 {

    let firebaseURL = ""
    let firebasePath = "iot"
    let lastSendStatus = false


    //============================
    // CONFIG
    //============================

    //% subcategory="Firebase"
    //% block="Firebase set URL %url"
    export function setFirebaseURL(url: string) {
        firebaseURL = url
    }

    //% subcategory="Firebase"
    //% block="Firebase set path %path"
    //% path.defl="iot"
    export function setFirebasePath(path: string) {
        firebasePath = path
    }


    //============================
    // HELPER
    //============================

    function extractHost(url: string): string {
        let host = url

        if (host.includes("https://")) {
            host = host.substr(8)
        }

        if (host.includes("http://")) {
            host = host.substr(7)
        }

        if (host.charAt(host.length - 1) == "/") {
            host = host.substr(0, host.length - 1)
        }

        return host
    }

    function cleanPath(path: string): string {
        if (path.charAt(0) == "/") {
            return path.substr(1)
        }
        return path
    }


    //============================
    // SEND DATA
    //============================

    //% blockHidden=true
    export function sendFirebase(path: string, json: string) {

        lastSendStatus = false

        if (!isWifiConnected()) return
        if (firebaseURL == "") return


        let host = extractHost(firebaseURL)
        path = cleanPath(path)


        if (!sendCommand(
            "AT+CIPSTART=\"SSL\",\"" + host + "\",443",
            "OK",
            4000
        )) return


        let requestPath = "/" + path + ".json"

        let http = "PATCH " + requestPath + " HTTP/1.1\r\n"
        http += "Host: " + host + "\r\n"
        http += "Content-Type: application/json\r\n"
        http += "Content-Length: " + json.length + "\r\n"
        http += "Connection: close\r\n\r\n"
        http += json


        if (!sendCommand("AT+CIPSEND=" + http.length, "OK")) {
            sendCommand("AT+CIPCLOSE", "OK", 1000)
            return
        }


        sendCommand(http, null, 100)


        if (getResponse("SEND OK", 2000) == "") {
            sendCommand("AT+CIPCLOSE", "OK", 1000)
            return
        }


        let res = getResponse("", 2000)

        if (res.includes("200")) {
            lastSendStatus = true
        }


        sendCommand("AT+CIPCLOSE", "OK", 1000)
    }


    //============================
    // READY FUNCTIONS
    //============================


    //% subcategory="Firebase"
    //% block="Firebase send SENSOR %name value %value unit %unit"
    //% unit.defl="C"
    export function sendSensor(
        name: string,
        value: number,
        unit: string
    ) {

        let json =
            "{\"" + name + "\":{" +
            "\"type\":\"sensor\"," +
            "\"value\":" + value + "," +
            "\"unit\":\"" + unit + "\"" +
            "}}"

        sendFirebase(firebasePath, json)
    }


    //% subcategory="Firebase"
    //% block="Firebase send SWITCH %name value %value"
    //% value.min=0 value.max=1
    export function sendSwitch(
        name: string,
        value: number
    ) {

        let v = value == 1 ? 1 : 0

        let json =
            "{\"" + name + "\":{" +
            "\"type\":\"switch\"," +
            "\"value\":" + v +
            "}}"

        sendFirebase(firebasePath, json)
    }


    //% subcategory="Firebase"
    //% block="Firebase send NUMBER %name value %value"
    export function sendNumber(
        name: string,
        value: number
    ) {

        let json =
            "{\"" + name + "\":{" +
            "\"type\":\"number\"," +
            "\"value\":" + value +
            "}}"

        sendFirebase(firebasePath, json)
    }



    //============================
    // CUSTOM JSON
    //============================

    //% subcategory="Firebase"
    //% block="Firebase send custom %json"
    export function sendCustom(json: string) {

        sendFirebase(firebasePath, json)

    }



    //============================
    // STATUS
    //============================

    //% subcategory="Firebase"
    //% block="Firebase last send success"
    export function firebaseSuccess(): boolean {
        return lastSendStatus
    }


}
