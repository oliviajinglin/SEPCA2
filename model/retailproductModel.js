var db = require('./databaseConfig.js');
var RetailProduct = require('./retailproduct.js');
var retailProductDB = {
    getAllRetailProducts: function () {
        return new Promise((resolve, reject) => {
            var conn = db.getConnection();
            conn.connect(function (err) {
                if (err) {
                    conn.end();
                    return reject(err);
                }
                var sql = 'SELECT i.ID as id, i.NAME as name, rp.IMAGEURL as imageURL, i.SKU as sku, i.DESCRIPTION as description, i.TYPE as type, i.CATEGORY as category, i._LENGTH as length, i.WIDTH as width, i.HEIGHT as height FROM itementity i, retailproductentity rp WHERE i.ID = rp.ID AND i.ISDELETED = FALSE;';
                conn.query(sql, function (err, result) {
                    conn.end();
                    if (err) return reject(err);
                    let productList = result.map(r => {
                        let p = new RetailProduct();
                        p.id = r.id;
                        p.name = r.name;
                        p.imageURL = r.imageURL;
                        p.sku = r.sku;
                        p.description = r.description;
                        p.type = r.type;
                        p.category = r.category;
                        p.length = r.length;
                        p.width = r.width;
                        p.height = r.height;
                        return p;
                    });
                    resolve(productList);
                });
            });
        });
    },

    getRetailProductByCat: function (cat, countryId) {
        return new Promise((resolve, reject) => {
            var conn = db.getConnection();
            conn.connect(function (err) {
                if (err) {
                    conn.end();
                    return reject(err);
                }

                let sql, params = [];
                if (cat === 'All Retail Products') {
                    if (countryId) {
                        sql = `SELECT i.ID as id, i.NAME as name, rp.IMAGEURL as imageURL, i.SKU as sku, i.DESCRIPTION as description,
                               i.TYPE as type, i.CATEGORY as category, ic.RETAILPRICE as price
                               FROM itementity i, retailproductentity rp, item_countryentity ic
                               WHERE i.ID = rp.ID AND i.ID = ic.ITEM_ID AND i.ISDELETED = FALSE AND ic.COUNTRY_ID = ?;`;
                        params = [countryId];
                    } else {
                        sql = `SELECT i.ID as id, i.NAME as name, rp.IMAGEURL as imageURL, i.SKU as sku, i.DESCRIPTION as description,
                               i.TYPE as type, i.CATEGORY as category
                               FROM itementity i, retailproductentity rp
                               WHERE i.ID = rp.ID AND i.ISDELETED = FALSE;`;
                    }
                } else {
                    if (countryId) {
                        sql = `SELECT i.ID as id, i.NAME as name, rp.IMAGEURL as imageURL, i.SKU as sku, i.DESCRIPTION as description,
                               i.TYPE as type, i.CATEGORY as category, ic.RETAILPRICE as price
                               FROM itementity i, retailproductentity rp, item_countryentity ic
                               WHERE i.ID = rp.ID AND i.ID = ic.ITEM_ID AND i.ISDELETED = FALSE AND ic.COUNTRY_ID = ? AND i.CATEGORY = ?;`;
                        params = [countryId, cat];
                    } else {
                        sql = `SELECT i.ID as id, i.NAME as name, rp.IMAGEURL as imageURL, i.SKU as sku, i.DESCRIPTION as description,
                               i.TYPE as type, i.CATEGORY as category
                               FROM itementity i, retailproductentity rp
                               WHERE i.ID = rp.ID AND i.CATEGORY = ? AND i.ISDELETED = FALSE;`;
                        params = [cat];
                    }
                }

                conn.query(sql, params, function (err, result) {
                    conn.end();
                    if (err) return reject(err);
                    let productList = result.map(r => {
                        let p = new RetailProduct();
                        p.id = r.id;
                        p.name = r.name;
                        p.imageURL = r.imageURL;
                        p.sku = r.sku;
                        p.description = r.description;
                        p.type = r.type;
                        p.category = r.category;
                        p.price = r.price;
                        return p;
                    });
                    resolve(productList);
                });
            });
        });
    },

    getRetailProductBySku: function (countryId, sku) {
        return new Promise((resolve, reject) => {
            var conn = db.getConnection();
            conn.connect(function (err) {
                if (err) {
                    conn.end();
                    return reject(err);
                }

                let sql, params;
                if (countryId) {
                    sql = `SELECT i.ID as id, i.NAME as name, rp.IMAGEURL as imageURL, i.SKU as sku, i.DESCRIPTION as description,
                           i.TYPE as type, i.CATEGORY as category, ic.RETAILPRICE as price
                           FROM itementity i, retailproductentity rp, item_countryentity ic
                           WHERE i.ID = rp.ID AND i.ID = ic.ITEM_ID AND i.ISDELETED = FALSE AND ic.COUNTRY_ID = ? AND i.SKU = ?;`;
                    params = [countryId, sku];
                } else {
                    sql = `SELECT i.ID as id, i.NAME as name, rp.IMAGEURL as imageURL, i.SKU as sku, i.DESCRIPTION as description,
                           i.TYPE as type, i.CATEGORY as category
                           FROM itementity i, retailproductentity rp
                           WHERE i.ID = rp.ID AND i.ISDELETED = FALSE AND i.SKU = ?;`;
                    params = [sku];
                }

                conn.query(sql, params, function (err, result) {
                    conn.end();
                    if (err) return reject(err);
                    let r = result[0];
                    let retailProduct = new RetailProduct();
                    retailProduct.id = r.id;
                    retailProduct.name = r.name;
                    retailProduct.imageURL = r.imageURL;
                    retailProduct.sku = r.sku;
                    retailProduct.description = r.description;
                    retailProduct.type = r.type;
                    retailProduct.category = r.category;
                    retailProduct.price = r.price;
                    resolve(retailProduct);
                });
            });
        });
    },

    addRetailProduct: function (data) {
        return new Promise((resolve, reject) => {
            var conn = db.getConnection();
            conn.connect(function (err) {
                if (err) {
                    conn.end();
                    return reject(err);
                }

                const { name, category, description, sku, length, width, height } = data;
                var volume = parseFloat(length) * parseFloat(width) * parseFloat(height);
                var sql = 'INSERT INTO itementity(DTYPE, SKU, _LENGTH, CATEGORY, DESCRIPTION, HEIGHT, NAME, TYPE, VOLUME, WIDTH) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                var sqlArgs = ["RetailProductEntity", sku, length, category, description, height, name, "Retail Product", volume, width];

                conn.query(sql, sqlArgs, function (err, result) {
                    if (err) {
                        conn.end();
                        return reject(err);
                    }

                    if (result.affectedRows > 0) {
                        const itemId = result.insertId;
                        retailProductDB.addRetailProduct2(itemId, data.imgPath)
                            .then(() => retailProductDB.insertRetailPrice(itemId, data.countryId, data.price))
                            .then(() => {
                                conn.end();
                                resolve({ success: true, sku: sku });
                            })
                            .catch(err => {
                                conn.end();
                                reject(err);
                            });
                    }
                });
            });
        });
    },

    addRetailProduct2: function (id, imgPath) {
        return new Promise((resolve, reject) => {
            var conn = db.getConnection();
            conn.connect(function (err) {
                if (err) return reject(err);
                var sql = 'INSERT INTO retailproductentity(ID, IMAGEURL) VALUES (?, ?)';
                conn.query(sql, [id, imgPath], function (err, result) {
                    conn.end();
                    if (err) return reject(err);
                    resolve(result.affectedRows > 0);
                });
            });
        });
    },

    insertRetailPrice: function (itemId, countryId, price) {
        return new Promise((resolve, reject) => {
            var conn = db.getConnection();
            conn.connect(function (err) {
                if (err) return reject(err);
                var sql = 'INSERT INTO item_countryentity(ITEM_ID, COUNTRY_ID, RETAILPRICE) VALUES (?, ?, ?)';
                conn.query(sql, [itemId, countryId, price], function (err, result) {
                    conn.end();
                    if (err) return reject(err);
                    resolve(result.affectedRows > 0);
                });
            });
        });
    },


    // keep update, remove functions unchanged (already working)
    updateRetailProduct: function (data) { /* ... */ },
    removeRetailProduct: function (ids) { /* ... */ },
    removeRetailProduct2: function (idString) { /* ... */ },
    removeRetailProduct3: function (idString) { /* ... */ }
};

 module.exports = retailProductDB;
