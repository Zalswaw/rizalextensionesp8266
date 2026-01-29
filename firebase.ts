let serverHost = ""
let serverPath = "/iot.php"

namespace firebase {

    let uploadSuccess = false

    //============================
    // SET SERVER HOST
    //============================

    //% subcategory="Server"
    //% block="Set Firebase Server %host"
    export function setServerHost(host: string) {

        serverHost = host
            .replace("http://", "")
            .replace("https://", "")
            .replace("/", "")
    }

    //============================
    // SET SERVER PATH
    //============================

    //% subcategory="Server"
    //% block="Set Firebase Path %path"
    export function setServerPath(path: string) {

        if (path.charAt(0) != "/") {
            path = "/" + path
        }

        serverPath = path
    }

    //============================
    // UPLOAD STATUS
    //============================

    //% subcategory="Server"
    //% block="Firebase Upload Success"
    export function isUploadSuccess(): boolean {
        return uploadSuccess
    }

    //============================
    // SEND TO SERVER
    //============================

    //% subcategory="Server"
    //% block="Send Firebase path %path data %data"
    export function send(path: string, data: string) {

        uploadSuccess = false

        if (!esp8266.isWifiConnected()) return
        if (serverHost == "") return


        if (!esp8266.sendCommand(
            "AT+CIPSTART=\"TCP\",\"" + serverHost + "\",80",
            "OK",
            5000
        )) return


        let safeData = esp8266.formatUrl(data)

        let url = serverPath + "?path=" + path + "&data=" + safeData


        let request = "GET " + url + " HTTP/1.1\r\n"
        request += "Host: " + serverHost + "\r\n"
        request += "Connection: close\r\n\r\n"


        esp8266.sendCommand("AT+CIPSEND=" + request.length)
        esp8266.sendCommand(request)


        if (esp8266.getResponse("SEND OK", 3000) == "") {
            esp8266.sendCommand("AT+CIPCLOSE", "OK", 1000)
            return
        }


        if (esp8266.getResponse("200 OK", 5000) == "") {
            esp8266.sendCommand("AT+CIPCLOSE", "OK", 1000)
            return
        }


        esp8266.sendCommand("AT+CIPCLOSE", "OK", 1000)

        uploadSuccess = true
    }
}
