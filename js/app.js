//将几个需要的标识符储存在全局的词法环境上
var _marker;
window._marker = _marker
var _infowindow
var filtetText = ko.observable("")
var searchAPI = 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=';


var placeData = [{
    position: { lat: 22.546724867, lng: 113.9191249 },
    tittle: "深圳中山公园"
},
{
    position: { lat: 22.5579808, lng: 113.94744906 },
    tittle: "松坪山公园"
},
{
    position: { lat: 22.5344374, lng: 113.972769118 },
    tittle: "深圳世界之窗"
},
{
    position: { lat: 22.5330717, lng: 113.93279314 },
    tittle: "深圳大学"
}];


//地图上几个标记的对象函数
var Place = function (data) {
    var self = this;
    this.tittle = data.tittle;
    this.position = data.position;
    this.visible = ko.computed(function () {
        var re = filtetText();
        var placeName = self.tittle;
        return (placeName.indexOf(re) != -1)
    })
    this.marker = new google.maps.Marker({
        position: self.position,
        tittle: self.tittle,
        animation: google.maps.Animation.BOUNCE
    });

    google.maps.event.addListener(self.marker, 'click', (event) => {

        //先清除，防止重复叠加
        if (self.marker.getAnimation() != null) {
            self.marker.setAnimation(null)
        }
        else {
            self.marker.setAnimation(google.maps.Animation.BOUNCE)
            setTimeout(() => {
                self.marker.setAnimation(null)
            }, 2000);
        }

        window["_marker"] = self.marker
        $.ajax({
            url: searchAPI + self.tittle + "&cb=showinfowindow",
            dataType: "jsonp",
            timeout: 2000,
        }).fail(function(){//错误处理,但是这里百度这个调用有问题,当真正错误的时候,会等到2秒后弹出提示.但正常情况下,也会提示错误,并且会立即提示.
            alert("似乎网络不好,或者挂了VPN,连不上百度!")
            
        })
    });

}

/**点击显示infowindow 
 * @param {data:object}   查询百度搜索返回的API对象数据
*/
function showinfowindow(data) {
    //保持一个infowindow打开，防止多个重叠
    if (_infowindow) {
        _infowindow.close();
    }
    _infowindow = new google.maps.InfoWindow({
        content: data.s.toString()
    });
    _infowindow.open(map, window._marker);
}
/**视图函数 */
var viewModal = function () {
    this.placeList = [];
    var self = this;
    placeData.forEach((place) => {
        self.placeList.push(new Place(place))
    })

    this.placeList.forEach((place) => {
        place.marker.setMap(map, place.position)
    })

    this.filteredList = ko.computed(function () {
        let result = [];
        self.placeList.forEach((place) => {
            if (place.visible()) {
                result.push(place)
                place.marker.setMap(map, place.position)
            }
            else {
                place.marker.setMap(null)
            }
        });

        return result;
    })

    //点击列表中的项响应
    this.listClick = (place) => {
        google.maps.event.trigger(place.marker, 'click');
    }

}
/**google 调用的回掉 */
function start() {
    initialize();
    ko.applyBindings(new viewModal());

}
