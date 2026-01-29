let serverHost = ""
let serverPath = "/iot.php"

namespace esp8266 {

    let uploadSuccess = false

    //============================
    // SET SERVER HOST
    //============================

    //% subcategory="Server"
    //% block="Set Server Host %host"
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
    //% block="Set Server Path %path"
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
    //% block="Upload success"
    export function isUploadSuccess(): boolean {
        return uploadSuccess
    }

    //============================
    // SEND TO SERVER
    //============================

    //% subcategory="Server"
    //% block="Send to Server Path %path Data %data"
    export function sendToServer(path: string, data: string) {

        uploadSuccess = false

        if (!isWifiConnected()) return
        if (serverHost == "") return


        if (!sendCommand(
            "AT+CIPSTART=\"TCP\",\"" + serverHost + "\",80",
            "OK",
            5000
        )) return


        let safeData = formatUrl(data)

        let url = serverPath + "?path=" + path + "&data=" + safeData


        let request = "GET " + url + " HTTP/1.1\r\n"
        request += "Host: " + serverHost + "\r\n"
        request += "Connection: close\r\n\r\n"


        sendCommand("AT+CIPSEND=" + request.length)
        sendCommand(request)


        if (getResponse("SEND OK", 3000) == "") {
            sendCommand("AT+CIPCLOSE", "OK", 1000)
            return
        }


        if (getResponse("200 OK", 5000) == "") {
            sendCommand("AT+CIPCLOSE", "OK", 1000)
            return
        }


        sendCommand("AT+CIPCLOSE", "OK", 1000)

        uploadSuccess = true
    }
}

