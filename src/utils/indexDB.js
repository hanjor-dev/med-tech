
import vtkSTLReader from '@kitware/vtk.js/IO/Geometry/STLReader';
const indexDB = window.indexedDB || window.webkitIndexedDB ||
  window.mozIndexedDB;

class IndexDBCache {
  constructor(callback) {
    this._db = null;
    this._transaction = null;
    this._request = null;
    this._cacheTableName = 'modalcache';
    this._dbversion = 1;
    this.initDB(callback);
  }
  initDB(callback) {
    this._request = indexDB.open('cacheModel', this._dbversion);
    this._request.onsuccess = event => {
      this._db = this._request.result;
      console.log('success db');
      if (typeof callback === 'function') callback();
    };
    this._request.onerror = event => {
      console.log('indexdb初始化失败');
      if (typeof callback === 'function') callback();
    };
    this._request.onupgradeneeded = event => {
      console.log('upgradeneeded')
      let db = this._request.result;
      // console.log('dfsdfs');
      let store = db.createObjectStore(this._cacheTableName, { keyPath: 'id' });
      store.createIndex("INDEX_ID", "id", { unique: true });
    }
  }
  URLValues(url) {
    return url.replace('+',"%2B")
  }
  loadNetSource(url) {
    let that = this
    return new Promise((resolve, reject) => {
      fetch(this.URLValues(url)).then(res => {
        if (res.status === 200) {
          res.blob().then(blob => {
            let transaction = that._db.transaction(that._cacheTableName, 'readwrite');
            let store = transaction.objectStore(that._cacheTableName);
            let storeReq = store.add({ id: url, blob });
            storeReq.onerror = event => {
              console.log('缓存失败');
              reject(url);
            }
            storeReq.onsuccess = event => {
              if(url.indexOf('zip')>0) {
                console.log(1)
                resolve(blob)
                return
              }
              console.log(`创建${url}缓存成功`);
              renderSTL(blob).then(imageData => {
                resolve(imageData);
              })
            }
          })
        } else {
          console.log('未找到缓存资源');
          reject(url);
        }
      })
    })
  }
  cacheModel(url) {
    let that = this
    return new Promise((resolve, reject) => {
      let transaction = that._db.transaction(that._cacheTableName, 'readwrite');
      let store = transaction.objectStore(that._cacheTableName);
      let response = store.get(url);
      let start = new Date().valueOf()
      response.onsuccess = e => {
        if (!response.result) {
          this.loadNetSource(url).then(blob => {
            resolve(blob);
          }).catch(err => {
            resolve(url);
          })
          return
        }
        if(response.result.id.indexOf('zip')>0) {
          resolve(response.result.blob)
        }
        var reader = new FileReader();
        reader.readAsArrayBuffer(response.result.blob);
        reader.onload = function (e) {
          const STLReader = vtkSTLReader.newInstance()
          STLReader.parseAsArrayBuffer(reader.result)
          resolve(STLReader);
        }
        // let _url = URL.createObjectURL(response.result.blob);
        // resolve(_url);
      }
      response.onerror = () => {
        resolve(url);
      }
    })

  }
  deleteModel(url) {
    return new Promise((resolve, reject) => {
      let transaction = this._db.transaction(this._cacheTableName, 'readwrite');
      let store = transaction.objectStore(this._cacheTableName);
      let response = store.get(url);
      response.onsuccess = () => {
        console.log('删除成功');
        resolve('删除成功');
      }
      response.onerror = (event) => {
        console.log('删除失败');
        reject(event);
      }
    })
  }
}
function renderSTL(blob) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.onload = function (e) {
      const STLReader = vtkSTLReader.newInstance()
      STLReader.parseAsArrayBuffer(reader.result)
      resolve(STLReader);
    }
  })
}
export default {
  IndexDBCache
}