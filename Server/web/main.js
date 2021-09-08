        var button = document.getElementById('btn');
        var led1 = document.getElementById('led 1');
        var led2 = document.getElementById('led 2');
        var led3 = document.getElementById('led 3');
        var url = window.location.host; // hàm trả về url của trang hiện tại kèm theo port
        var ws = new WebSocket('ws://' + url + '/ws'); // mở 1 websocket với port 8000  
        
        console.log('connecting...')

        // WebSocket ----------------------------------------------------------------------------
            
        ws.onopen = function() //khi websocket được mở thì hàm này sẽ được thưc hiện
            {
                document.getElementById('status').innerHTML = 'Connected';
                led1.disabled = false; //khi websocket được mở, mới cho phép
                led2.disabled = false; //khi websocket được mở, mới cho phép
                led3.disabled = false; //khi websocket được mở, mới cho phép
                console.log('connected...')
                document.getElementById('temp').innerHTML = 0.0;
                document.getElementById('humd').innerHTML = 0.0;
            };
                ws.onmessage = function(evt) // sự kiện xảy ra khi client nhận dữ liệu từ server
            {
                console.log(evt.data)
                if (evt.data == 'BTN_PRESSED') {
                    document.getElementById('btn').innerHTML = "Pressed";
                } else if (evt.data == 'BTN_RELEASE') {
                    document.getElementById('btn').innerHTML = "Released";
                } else if (evt.data == 'LED1_OFF') {
                    led1.checked = false;
                } else if (evt.data == 'LED1_ON') {
                    led1.checked = true;
                } else if (evt.data == 'LED2_OFF') {
                    led2.checked = false;
                } else if (evt.data == 'LED2_ON') {
                    led2.checked = true;
                } else if (evt.data == 'LED3_OFF') {
                    led3.checked = false;
                } else if (evt.data == 'LED3_ON') {
                    led3.checked = true;
                } else if (evt.data == 'RAIN_ON') {
                    document.getElementById('btn').innerHTML = "Raining";
                } else if (evt.data == 'RAIN_OFF') {
                    document.getElementById('btn').innerHTML = "Not rain";
            };
                    
            ws.onclose = function() { // hàm này sẽ được thực hiện khi đóng websocket
                led.disabled = true;
                document.getElementById('status').innerHTML = 'Connected';
            };

            led1.onchange = function() { // thực hiện thay đổi bật/tắt led
            var led_status = 'LED1_OFF';
            if (led1.checked) {
                led_status = 'LED1_ON';
            }
                ws.send(led_status)
            }

            led2.onchange = function() { // thực hiện thay đổi bật/tắt led
                var led_status = 'LED2_OFF';
                if (led2.checked) {
                    led_status = 'LED2_ON';
                }
                    ws.send(led_status)
            }

            led3.onchange = function() { // thực hiện thay đổi bật/tắt led
                var led_status = 'LED3_OFF';
                if (led3.checked) {
                    led_status = 'LED3_ON';
                }
                    ws.send(led_status)
            }
            

        // HTTP ----------------------------------------------------------------------------
            function httpGetAsync(theUrl, callback) {
                var xmlHttp = new XMLHttpRequest();
                xmlHttp.onreadystatechange = function() {
                    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                        callback(JSON.parse(xmlHttp.responseText));            
                }
                xmlHttp.open("GET", theUrl, true) // true for asynchronous
                xmlHttp.send(null);
            }
            window.onload = function() {
                var dataTemp = [];
                var dataHumd = [];
                var Chart = new CanvasJS.Chart("ChartContainer", {
                    zoomEnabled: true, // Dùng thuộc tính có thể zoom vào graph
                    title: {
                        text: "Temprature & Humidity" // Viết tiêu đề cho graph
                    },
                    toolTip: { // Hiển thị cùng lúc 2 trường giá trị nhiệt độ, độ ẩm trên graph
                        shared: true
                    },
                    axisX: {
                        title: "chart updates every 2 secs" // Chú thích cho trục X
                    },
                    data: [{
                            // Khai báo các thuộc tính của dataTemp và dataHumd
                            type: "line", // Chọn kiểu dữ liệu đường
                            xValueType: "dateTime", // Cài đặt kiểu giá trị tại trục X là thuộc tính thời gian
                            showInLegend: true, // Hiển thị "temp" ở mục chú thích (legend items)
                            name: "temp",
                            dataPoints: dataTemp // Dữ liệu hiển thị sẽ lấy từ dataTemp
                        },
                        {
                            type: "line",
                            xValueType: "dateTime",
                            showInLegend: true,
                            name: "humd",
                            dataPoints: dataHumd
                        }
                        ],
                    });
            ////////////////////////////////////////////////////////////////////////////////////////
            var yHumdVal = 0; // Biến lưu giá trị độ ẩm (theo trục Y)
            var yTempVal = 0; // Biến lưu giá trị nhiệt độ (theo trục Y)
            var updateInterval = 2000; // Thời gian cập nhật dữ liệu 2000ms = 2s
            var time = new Date(); // Lấy thời gian hiện tại
            
            var updateChart = function() {
                    httpGetAsync('/get', function(data) {
                        // Gán giá trị từ localhost:8000/get vào textbox để hiển thị
                        document.getElementById("temp").innerHTML = data[0].temp;
                        document.getElementById("humd").innerHTML = data[0].humd;
                        // Xuất ra màn hình console trên browser giá trị nhận được từ localhost:8000/get
                        console.log(data);
                        // Cập nhật thời gian và lấy giá trị nhiệt độ, độ ẩm từ server
                        time.setTime(time.getTime() + updateInterval);
                        yTempVal = parseInt(data[0].temp);
                        yHumdVal = parseInt(data[0].humd);
                        dataTemp.push({ // cập nhât dữ liệu mới từ server
                            x: time.getTime(),
                            y: yTempVal
                        });
                        dataHumd.push({
                            x: time.getTime(),
                            y: yHumdVal
                        });
                        Chart.render(); // chuyển đổi dữ liệu của của graph thành mô hình đồ họa
                    });
                };
                updateChart(); // Chạy lần đầu tiên
                
                setInterval(function() { // Cập nhật lại giá trị graph sau thời gian updateInterval
                    updateChart()
                }, updateInterval);
           }}


        const to_top = document.querySelector('.to-top')
        window.addEventListener('scroll', ()=>{
            if (window.pageYOffset>100){
                    to_top.classList.add('active')
            } else {
                    to_top.classList.remove('active')
            }
    })
    