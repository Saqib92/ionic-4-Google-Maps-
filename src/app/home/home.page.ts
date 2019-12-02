import { Component, ViewChild, ElementRef  } from '@angular/core';
 
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
 
declare var google;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
@ViewChild('map', {static: false}) mapElement: ElementRef;
  map: any;
  address:string;

  constructor(
  	private geolocation: Geolocation,
  	private nativeGeocoder: NativeGeocoder
  ) {}

  ngOnInit() {
    this.loadMap();
  }

  loadMap() {
    this.geolocation.getCurrentPosition().then((resp) => {
      let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
 
      //this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude);
 		this.getAddress(resp.coords.latitude, resp.coords.longitude)
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
 
      this.map.addListener('tilesloaded', () => {
        console.log('accuracy',this.map);
    //    this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng())
    	this.getAddress(this.map.center.lat(), this.map.center.lng())
      });
 
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }
 
  // getAddressFromCoords(lattitude, longitude) {
  //   console.log("getAddressFromCoords "+lattitude+" "+longitude);
  //   let options: NativeGeocoderOptions = {
  //     useLocale: true,
  //     maxResults: 5
  //   };
 
  //   this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
  //     .then((result: NativeGeocoderReverseResult[]) => {
  //       this.address = "";
  //       let responseAddress = [];
  //       for (let [key, value] of Object.entries(result[0])) {
  //         if(value.length>0)
  //         responseAddress.push(value);
 
  //       }
  //       responseAddress.reverse();
  //       for (let value of responseAddress) {
  //         this.address += value+", ";
  //       }
  //       this.address = this.address.slice(0, -2);
  //     })
  //     .catch((error: any) =>{ 
  //       this.address = "Address Not Available!";
  //     });
 
  // }

    getAddress(lat, lng){
    let options: NativeGeocoderOptions = {
        useLocale: true,
        maxResults: 5
    };

    this.nativeGeocoder.reverseGeocode(lat, lng, options)
      .then((result: NativeGeocoderResult[]) => {
        console.log('Geo Coder ADDRESSSSSSSS', JSON.stringify(result));
        this.address = this.generateAddress(result[0]);
        console.log('address', this.address);
      })
      .catch((error: any) => console.log(error));
  }

  generateAddress(addressObj){
        let obj = [];
        let address = "";
        for (let key in addressObj) {
          obj.push(addressObj[key]);
        }
        obj.reverse();
        for (let val in obj) {
          if(obj[val].length)
          address += obj[val]+', ';
        }
      return address.slice(0, -2);
    }

}
