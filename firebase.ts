let firebaseHost = ""
let firebasePath = "/iot.php"

namespace firebase {

    let uploadSuccess = false

    //% subcategory="Server"
    //% block="Set Firebase Host %host"
    export function setHost(host: string) {

        firebaseHost = host
            .replace("http://", "")
            .replace("https://", "")
            .replace("/", "")
    }

    //% subcategory="Server"
    //% block="Set Firebase Path %path"
    export function setPath(path: string) {

        if (path.charAt(0) != "/") {
            path = "/" + path
        }

        firebasePath = path
    }

    //% subcategory="Server"
    //% block="Firebase upload success"
    export function isUploadSuccess(): boolean {
        return uploadSuccess
    }

    //% subcategory="Server"
    //% block="Send to Firebase Path %path Data %data"
    export function send(path: string, data: string) {

        uploadSuccess = false

        if (!esp8266.isWifiConnected()) return
        if (firebaseHost == "") return


        if (!esp8266.sendCommand(
            "AT+CIPSTART=\"TCP\",\"" + firebaseHost + "\",80",
            "OK",
            5000
        )) return


        let safeData = esp8266.formatUrl(data)

        let url = firebasePath + "?path=" + path + "&data=" + safeData


        let request = "GET " + url + " HTTP/1.1\r\n"
        request += "Host: " + firebaseHost + "\r\n"
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

