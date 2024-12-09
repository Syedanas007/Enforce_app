import React from 'react';
import Geocoder from 'react-native-geocoding';

export default class GeoCoder {
  
    initiaLizeGeoCoder (){
        Geocoder.init("AIzaSyB3hwfUatf5xJi7MXu_1XOBhce0k5vtmFo");
    }
     getPlaceFromCordinate = async(latitude,longitude) => {
         console.log('------ called',latitude,longitude);
       return Geocoder.from(latitude, longitude) 
        .then(json => {
            var route = ''
            var locality = ''
            var administrative_area_level_2 = ''
            var administrative_area_level_1 = ''
            var postal_code = ''
            var country = ''
            var street_number = ''
            var addressComponent = json.results[0];
            var formmatedAddress = json.results[0].formatted_address;
            var geomatry =  json.results[0].geometry;
            const addressFromat = addressComponent.address_components.map(async(item) => {
                const routeType = await item.types.map(type => {
                     if (type === 'route') {
                         route = item.long_name;
                         street_number = item.short_name;
                     } else if (type === 'locality') {
                         locality = item.long_name;
                     } else if (type === 'administrative_area_level_1') {
                         administrative_area_level_1 = item.long_name
                     } else if (type === 'country') {
                         country = item.long_name;
                     }
                });  
            });
            
           

            return {
                formatted_address: formmatedAddress,
                street_number: street_number,
                country: country,
                administrative_area_level_1: administrative_area_level_1,
                administrative_area_level_2: administrative_area_level_2,
                locality: locality,
                route: route,
                postal_code: postal_code,
                latitude:geomatry.location.lat,
                longitude:geomatry.location.lng
            }
        })
        .catch(error => {
            return {
                formatted_address: "",
                street_number: "",
                country: "",
                administrative_area_level_1: "",
                administrative_area_level_2: "",
                locality: "",
                route: "",
                postal_code: "",
                latitude:0.0,
                longitude:0.0
            }
        
        });
    }
}