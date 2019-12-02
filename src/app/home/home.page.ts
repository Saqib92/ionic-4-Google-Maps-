import { Component, ViewChild, ElementRef  } from '@angular/core';
 
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import {Observable,of, from } from 'rxjs';

declare var google;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
@ViewChild('map', {static: false}) mapElement: ElementRef;
@ViewChild('searchbar', { static: false, read: ElementRef }) searchbar: ElementRef;
  map: any;
  address:string;
addressElement: HTMLInputElement = null;
  constructor(
  	private geolocation: Geolocation,
  	private nativeGeocoder: NativeGeocoder
  ) {}

  ngOnInit() {
    this.loadMap();
  }

  loadMap() {
  	let that = this;
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

     // Map drag started
    this.map.addListener('dragstart', function() {
      // console.log('Drag start');
    });
    // Map dragging
    this.map.addListener('drag', function() {
      that.address = 'Searching...';
    });
    //Reload markers every time the map moves
    this.map.addListener('dragend', function() {
      let map_center = that.getMapCenter();
      let latLngObj = {'lat': map_center.lat(), 'long': map_center.lng() };
      // console.log(latLngObj);
      that.getAddress(map_center.lat(), map_center.lng());
    });
 	this.initAutocomplete();
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }


   getMapCenter(){
    return this.map.getCenter()
  }

  initAutocomplete(): void {
    this.addressElement = this.searchbar.nativeElement.querySelector('.searchbar-input');
    this.createAutocomplete(this.addressElement).subscribe((location) => {
      console.log('Searchdata', location);
      let latLngObj = {'lat': location.lat(), 'long': location.lng()};
      this.getAddress(location.lat(), location.lng());
      let options = {
        center: location,
        zoom: 16
      };
      this.map.setOptions(options);
    });
  }

   createAutocomplete(addressEl: HTMLInputElement): Observable<any> {
    const autocomplete = new google.maps.places.Autocomplete(addressEl);
    autocomplete.bindTo('bounds', this.map);
    return new Observable((sub: any) => {
      google.maps.event.addListener(autocomplete, 'place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          sub.error({
            message: 'Autocomplete returned place with no geometry'
          });
        } else {
          let latLngObj = {'lat': place.geometry.location.lat(), 'long': place.geometry.location.lng()}
          this.getAddress(place.geometry.location.lat(),  place.geometry.location.lng());
          sub.next(place.geometry.location);
        }
      });
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
