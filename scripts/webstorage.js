if (!window.storageEngine) {
    storageEngine = function() {
        var initialized = false;
        var initializedObjectStores = {};

        function getStorageObject(type) { return JSON.parse(localStorage.getItem(type)); }

        function checkInit(type, errorCallback) {
            if (!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
                return false;
            } else if (!initializedObjectStores[type]) {
                errorCallback('store_not_initialized', 'The object store '+type+' has not been initialized');
                return false;
            }
            return true;
        }

        return {
            init: function(successCallback, failureCallback) {
                if (window.localStorage) {
                    initialized = true;
                    successCallback(null);
                } else {
                    errorCallback('storage_api_not_supported', 'The web storage api is not supported');
                }
            },

            initObjectStore: function(type, successCallback, errorCallback) {
                if (!initialized) {
                    errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
                    return;
                } else if (!localStorage.getItem(type)) {
                    localStorage.setItem(type, JSON.stringify({}));
                }
                initializedObjectStores[type] = true;
                successCallback(null);
            },

            save: function(type, obj, successCallback, errorCallback) {
                if (checkInit(type, errorCallback)) {
                    if (!obj.id) { obj.id = $.now(); }
                    var storageItem = JSON.parse(localStorage.getItem(type));
                    storageItem[obj.id] = obj;
                    localStorage.setItem(type, JSON.stringify(storageItem));
                    successCallback(obj);
                }
            },

            findAll: function(type, successCallback, errorCallback) {
                if (checkInit(type, errorCallback)) { 
                    var result = [];
                    var storageItem = getStorageObject(type);
                    $.each(storageItem, function(i, obj) { result.push(obj); });
                    successCallback(result);
                }
            },

            delete: function(type, id, successCallback, errorCallback) {
                if (checkInit(type, errorCallback)) {
                    var storageItem = getStorageObject(type);
                    if (storageItem[id]) {
                        delete storageItem[id];
                        localStorage.setItem(type, JSON.stringify(storageItem));
                        successCallback(id);
                    } else {
                        errorCallback('object_not_found', 'No object with id '+id+' was found');
                    }
                }
            },

            findByProperty: function(type, propertyName, propertyValue, successCallback, errorCallback) {
                if (checkInit(type, errorCallback)) {
                    var storageItem = getStorageObject(type);
                    var result = [];
                    $.each(storageItem, function(i, obj) {
                        if (obj[propertyName] === propertyValue) {
                            result.push(obj);
                        }
                    });
                    successCallback(result);
                }
            },

            findByID: function(type, id, successCallback, errorCallback) {
                if (checkInit(type, errorCallback)) {
                    successCallback(getStorageObject(type)[id]);
                }
            },
        }
    }();
}
