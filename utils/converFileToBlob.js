import React from 'react'

 function ConverFileToBlob(image) {
       new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      resolve(xhr.response);
    };
    xhr.onerror = function(e) {
      console.log(e);
      reject(new TypeError('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', image, true);
    xhr.send(null);
  })
}

export default ConverFileToBlob