//如果是nodemcu V3版，需要另外定义LED引脚
#include <ESP8266WiFi.h>
#include <DHT.h>//定义库的头文件

#define LED_BUILTIN 2 
#define DHTTYPE DHT11//温湿度传感器型号
#define DHT11_PIN 5//温湿度检测引脚
DHT dht(DHT11_PIN,DHTTYPE);//实例化

//必须修改：填写你的WIFI帐号密码
const char* ssid = "vivo iQOO";
const char* password = "hy5291258";

const char* host = "121.4.12.33";//121.4.12.33
const int port = 9003;//demo2 tcp 使用 9003端口

const char* id = "1234abcd";
int tick = 1000;

WiFiClient client;

//dht11类
class dhtst{
  public:float t;
  public:float h;
 };

dhtst dht11(dhtst dhtobj){
  //读取温湿度数据
  dht.begin();
  dhtobj.t=dht.readTemperature();//获取温度值，带小数点
  dhtobj.h=dht.readHumidity();//获取湿度值，带小数点
  delay(300);//读取数值时需要250us，所以这里延时了300us
  Serial.print("t=");
  Serial.print(dhtobj.t);  
  Serial.print("*C,h=");
  Serial.print(dhtobj.h);
  Serial.print("%\n");
  return dhtobj;
}

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(DHT11_PIN, INPUT);//对DHT数据端口进行端口设置
  //连接WIFI
  WiFi.begin(ssid, password);

  //设置读取socket数据时等待时间为100ms（默认值为1000ms，会显得硬件响应很慢）
  client.setTimeout(100);

  //等待WIFI连接成功
  while (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi connecting...");
    delay(500);
  }
  Serial.println("WiFi connected!.");
}

void loop() {
  // put your main code here, to run repeatedly:
  if (client.connect(host, port))
  {
    Serial.println("host connected!");
    //发送第一条TCP数据，发送ID号
    client.print(id);
  }
  else
  {
    // TCP连接异常
    Serial.println("host connecting...");
    delay(500);
  }

  while (client.connected()) {

    //获取dht11对象
    dhtst dhtobj;
    
    //delay(1000);//延时处理
    dhtobj=dht11(dhtobj);//获取数据并通过串口打印
    // TCP发送温湿度值
    client.print("t"+String(dhtobj.t));
    client.print("h"+String(dhtobj.h));

    
    //      接收到TCP数据
    if (client.available())
    {
      String line = client.readStringUntil('\n');
      if (line == "1") {
        Serial.println("command:open led.");
        digitalWrite(LED_BUILTIN, LOW);
        client.print("OK");
      }
      else if (line == "0") {
        Serial.println("command:close led.");
        digitalWrite(LED_BUILTIN, HIGH);
        client.print("OK");
      }
    }
//    else {
//      //若没收到TCP数据，每隔一段时间打印并发送tick值
//      Serial.print("tem:");
//      Serial.println(tick);
//      // TCP发送20-29之间随机数
//      client.print(20+random(0,10));
//      tick++;
//      delay(1000);
//    }
  }

}
