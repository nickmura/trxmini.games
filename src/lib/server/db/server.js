"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
// THIS IS SOLELY CONFIGURATION AND ENDPOINTS FOR FOR USERNAMES VIA POSTGRES
var express_1 = require("express");
var backblaze_b2_1 = require("backblaze-b2");
var multer_1 = require("multer");
var uuid_1 = require("uuid");
var cors_1 = require("cors");
var cred_js_1 = require("./cred.js");
//@ts-ignore
//@ts-ignore
var level_ts_1 = require("./level.ts");
var b2 = new backblaze_b2_1["default"]({
    applicationKeyId: level_ts_1.B2AppKeyID,
    applicationKey: level_ts_1.B2AppKey
});
cred_js_1.post.connect();
var app = (0, express_1["default"])();
app.use(express_1["default"].urlencoded({ extended: true }));
app.use(express_1["default"].json());
var whitelist = ['https://test2.trxmini.games', '//test2.trxmini.games', 'http://trxmini.games',
    'http://www.trxmini.games', 'http://localhost:5173', '//localhost:5173', 'http://localhost:5500', 'http://172.105.106.183:3001', 'http://172.105.106.183:3001'];
var config = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1)
            callback(null, true);
        else
            callback(new Error("CORS Policy denied, origin is unexpected origin ".concat(origin)));
    }
};
app.use((0, cors_1["default"])(config));
var rooms;
app.post('/address', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, insert, values;
    return __generator(this, function (_a) {
        user = req.body;
        insert = "insert into usernames(\"address\", \"games_played\", \"has_played\", \"games_won\", \"has_won_8ball\", \"xp\", \"is_beta\") \n    values($1, $2, $3, $4, $5, $6, $7)";
        values = ["".concat(user.address), 0, false, 0, false, 0, true];
        cred_js_1.post.query(insert, values, function (err, result) {
            if (!err)
                console.log('Insertion was successful');
            if (err)
                console.log(err);
        });
        return [2 /*return*/];
    });
}); });
app.post('/username', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, insert, insertDefault, values, insert_default_query, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                user = req.body;
                console.log(user);
                insert = "UPDATE usernames SET username = ($1) WHERE address = ($2)";
                insertDefault = "UPDATE usernames SET default_username = ($1) WHERE address = ($2)";
                values = ["".concat(user.name, ".trx"), "".concat(user.address)];
                console.log(values);
                cred_js_1.post.query(insert, values, function (err, result) {
                    if (!err)
                        console.log('Username insertion was successful');
                    else
                        console.log(err);
                });
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, cred_js_1.post.query(insertDefault, values)];
            case 2:
                insert_default_query = _a.sent();
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                console.log(err_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/username', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userAddress, user, select, values;
    return __generator(this, function (_a) {
        userAddress = req.query.addr;
        select = "SELECT username,default_username,has_won_8ball,xp FROM usernames WHERE address = ($1)";
        values = ["".concat(userAddress)];
        cred_js_1.post.query(select, values, function (err, result) {
            //if (!err) user = {address: userAddress, username: result.rows[0]}
            if (!err) {
                console.log('Selected query', result.rows[0]);
                if (result.rows[0] != undefined)
                    user = { address: userAddress, username: result.rows[0].username, defaultusername: result.rows[0].default_username, xp: result.rows[0].xp, hasWon8Ball: result.rows[0].has_won_8ball };
                if (user)
                    return res.json(user);
            }
            else
                console.log(err);
        });
        return [2 /*return*/];
    });
}); });
app.get('/getaddr', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var username, address, select, values;
    return __generator(this, function (_a) {
        username = req.query.username;
        select = "SELECT address FROM usernames WHERE username = ($1)";
        values = ["".concat(username)];
        cred_js_1.post.query(select, values, function (err, result) {
            if (!err) {
                console.log('Selected query', result);
                if (result.rows != undefined)
                    address = { address: result.rows[0].address, username: username };
                if (address)
                    return res.json(address);
            }
            else
                console.log(err);
        });
        return [2 /*return*/];
    });
}); });
app.post('/unique', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var username, select, value;
    return __generator(this, function (_a) {
        username = req.query.user;
        console.log(username);
        select = "SELECT COUNT(*) FROM usernames WHERE username = ($1)";
        value = ["".concat(username)];
        cred_js_1.post.query(select, value, function (err, result) {
            if (!err) {
                console.log('Selected query', result.rows[0].count);
                if (result.rows[0].count == 0)
                    return res.json({ unique: true });
                if (result.rows[0].count == 1)
                    return res.json({ unique: false });
            }
            else
                console.log(err);
        });
        return [2 /*return*/];
    });
}); });
app.post('/gamewon8ball', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, insert, values;
    return __generator(this, function (_a) {
        user = req.body;
        if (!user.name) {
            insert = "UPDATE usernames SET games_played=games_played+1,games_won=games_won+1,has_played=true,has_won_8ball=true,xp=xp+1000,is_beta=true WHERE address=($1)";
            values = ["".concat(user.address)];
        }
        else {
            insert = "UPDATE usernames SET games_played=games_played+1,games_won=games_won+1,has_played=true,has_won_8ball=true,xp=xp+1000,is_beta=true WHERE username=($1)";
            values = ["".concat(user.name)];
        }
        cred_js_1.post.query(insert, values, function (err, result) {
            if (!err)
                console.log('Game played & won set to player', user);
            else
                console.log(err);
        });
        return [2 /*return*/];
    });
}); });
app.post('/gameplayed', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, select, xp, insert, values, insertNotification, notification, error_1, lastLevel, currentLevel, uuid, error_2, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                user = req.body;
                if (!user.name) {
                    select = "SELECT xp FROM usernames WHERE address = ($1)";
                    insert = "UPDATE usernames SET games_played=games_played+1,has_played=true,xp=xp+350 WHERE address=($1)";
                    values = ["".concat(user.address)];
                }
                else {
                    select = "SELECT xp FROM usernames WHERE username = ($1)";
                    insert = "UPDATE usernames SET games_played=games_played+1,has_played=true,xp=xp+350 WHERE username=($1)";
                    values = ["".concat(user.name)];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, cred_js_1.post.query(select, values)];
            case 2:
                xp = _a.sent();
                xp = xp.rows[0].xp;
                console.log(xp);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.log(error_1);
                return [3 /*break*/, 4];
            case 4:
                lastLevel = (0, level_ts_1.getLevel)(xp);
                currentLevel = (0, level_ts_1.getLevel)(xp + 350);
                console.log(lastLevel, currentLevel);
                if (!(Math.floor(lastLevel) < Math.floor(currentLevel))) return [3 /*break*/, 8];
                console.log(lastLevel, currentLevel);
                uuid = (0, uuid_1.v4)();
                if (!user.name) {
                    insertNotification = "INSERT into notifications(\"address\",\"notification\", \"id\") values($1, $2, $3)";
                    notification = ["".concat(user.address), "You leveled up to level ".concat(Math.floor(currentLevel), "!"), "".concat(uuid)];
                }
                else {
                    insertNotification = "INSERT into notifications(\"username\",\"notification\", \"id\") values($1, $2, $3)";
                    notification = ["".concat(user.name), "You leveled up to level ".concat(Math.floor(currentLevel), "!"), "".concat(uuid)];
                }
                _a.label = 5;
            case 5:
                _a.trys.push([5, 7, , 8]);
                return [4 /*yield*/, cred_js_1.post.query(insertNotification, notification)];
            case 6:
                _a.sent();
                console.log('Created notification for level up');
                return [3 /*break*/, 8];
            case 7:
                error_2 = _a.sent();
                console.log('insertNotification error', error_2);
                return [3 /*break*/, 8];
            case 8:
                _a.trys.push([8, 10, , 11]);
                return [4 /*yield*/, cred_js_1.post.query(insert, values)];
            case 9:
                _a.sent();
                console.log('Game played set to player', user);
                return [3 /*break*/, 11];
            case 10:
                error_3 = _a.sent();
                console.log(error_3);
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/, res.json({ success: true })];
        }
    });
}); });
app.post('/gamewon', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, insert, values;
    return __generator(this, function (_a) {
        user = req.body;
        if (!user.name) {
            insert = "UPDATE usernames SET games_played=games_played+1,games_won=games_won+1,has_played=true,xp=xp+1000 WHERE address=($1)";
            values = ["".concat(user.address)];
        }
        else {
            insert = "UPDATE usernames SET games_played=games_played+1,games_won=games_won+1,has_played=true,xp=xp+1000 WHERE username=($1)";
            values = ["".concat(user.name)];
        }
        cred_js_1.post.query(insert, values, function (err, result) {
            if (!err)
                console.log('Game played & won set to player', user);
            else
                console.log(err);
        });
        return [2 /*return*/, res.json({ success: 'gameWon' })];
    });
}); });
app.get('/getxp', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, insert, values;
    return __generator(this, function (_a) {
        user = req.query.user;
        insert = "SELECT xp FROM usernames WHERE username = ($1)";
        values = ["".concat(user)];
        cred_js_1.post.query(insert, values, function (err, result) {
            if (!err) {
                console.log("Select xp from user ".concat(user));
                return res.json({ user: user, xp: result.rows[0].xp });
            }
            if (err)
                console.log(err);
        });
        return [2 /*return*/];
    });
}); });
app.post('/getnotifications', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, select, values, query, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                user = req.body;
                select = "SELECT notification,id FROM notifications WHERE address = ($1) OR username = ($2)";
                values = ["".concat(user.address), "".concat(user.name)];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, cred_js_1.post.query(select, values)];
            case 2:
                query = _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                console.log(error_4);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/, res.json(query.rows)];
        }
    });
}); });
app.post('/deletenotification', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var notification, deleteQuery, values, query, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                notification = req.body;
                deleteQuery = 'DELETE FROM notifications WHERE id = ($1)';
                values = ["".concat(notification.id)];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, cred_js_1.post.query(deleteQuery, values)];
            case 2:
                query = _a.sent();
                console.log('Deleted notification', notification.id);
                return [3 /*break*/, 4];
            case 3:
                error_5 = _a.sent();
                console.log(error_5);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post('/tipnotification', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tip, uuid, noti, query, insert, values, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                tip = req.body;
                uuid = (0, uuid_1.v4)();
                noti = "<a href='https://shasta.tronscan.org/#/transaction/".concat(tip.txid, "' target='_blank' rel='noreferrer'><u>You have recieved a tip from ").concat(tip.sender, " for ").concat(tip.amount, " TRX!</u></a>") // Should be changed to include the token.
                ;
                insert = "INSERT into notifications(\"address\", \"notification\", \"id\") values($1, $2, $3)";
                values = ["".concat(tip.recipient), "".concat(noti), "".concat(uuid)];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, cred_js_1.post.query(insert, values)];
            case 2:
                query = _a.sent();
                console.log('Success insertion', tip.recipient);
                return [3 /*break*/, 4];
            case 3:
                error_6 = _a.sent();
                console.log(error_6);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/, res.json(console.log({ success: tip.recipient }))];
        }
    });
}); });
app.post('/chessnotification', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var wager, uuid, noti, query, insert, values, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                wager = req.body;
                uuid = (0, uuid_1.v4)();
                noti = "<a href='https://shasta.tronscan.org/#/transaction/".concat(wager.txid, "' target='_blank' rel='noreferrer'><u>You won a chess game wager against ").concat(wager.opponent, " for ").concat(wager.amount, " TRX!</u></a>");
                if (wager.address) {
                    insert = "INSERT into notifications(\"address\", \"notification\", \"id\") values($1, $2, $3)";
                    values = ["".concat(wager.address), "".concat(noti), "".concat(uuid)];
                }
                else {
                    insert = "INSERT into notifications(\"username\", \"notification\", \"id\") values($1, $2, $3)";
                    values = ["".concat(wager.winner), "".concat(noti), "".concat(uuid)];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, cred_js_1.post.query(insert, values)];
            case 2:
                query = _a.sent();
                console.log('Success wager insertion', wager.winner);
                return [3 /*break*/, 4];
            case 3:
                error_7 = _a.sent();
                console.log(error_7);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/, res.json({ success: wager.txid })];
        }
    });
}); });
app.get('/getprofile', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, insert, values, query, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                user = req.query.user;
                insert = "SELECT address,username,default_username,img,has_played,games_played,games_won,has_won_8ball,xp,is_beta,description \n    FROM usernames WHERE username = ($1) OR default_username = ($1) OR previous_username = ($1)";
                values = ["".concat(user)];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, cred_js_1.post.query(insert, values)];
            case 2:
                query = _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_8 = _a.sent();
                console.log(error_8);
                return [3 /*break*/, 4];
            case 4:
                console.log('Successfully fetched profile information', query.rows[0]);
                return [2 /*return*/, res.json(query.rows[0])];
        }
    });
}); });
app.post('/uploadavatar', (0, multer_1["default"])({ storage: multer_1["default"].memoryStorage() }).single("avatar"), function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    function authenticate() {
        return __awaiter(this, void 0, void 0, function () {
            var auth, uploadUrlRequest;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, b2.authorize()];
                    case 1:
                        auth = _a.sent();
                        return [4 /*yield*/, b2.getUploadUrl({
                                bucketId: 'dd6eb222a9a75ebb88550a10'
                            })];
                    case 2:
                        uploadUrlRequest = _a.sent();
                        // console.log(uploadUrlRequest)
                        // console.log('uploadUrl.data', uploadUrlRequest.data)
                        uploadUrl_1 = uploadUrlRequest.data.uploadUrl;
                        uploadAuthToken_1 = uploadUrlRequest.data.authorizationToken;
                        console.log(uploadUrl_1);
                        return [2 /*return*/];
                }
            });
        });
    }
    function imageUpload(mime, originalName, buffer) {
        return __awaiter(this, void 0, void 0, function () {
            var uuid, upload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        uuid = Math.floor(Math.random() * 10000000);
                        upload = b2.uploadFile({
                            uploadUrl: uploadUrl_1,
                            uploadAuthToken: uploadAuthToken_1,
                            fileName: mime.includes('jpeg') && originalName.includes('jpg') ? "image-".concat(uuid, ".jpg") : mime.includes('jpeg') && originalName.includes('jpeg') ? "image-".concat(uuid, ".jpeg") : "image-".concat(uuid, ".png"),
                            mime: mime,
                            data: buffer
                        });
                        return [4 /*yield*/, upload];
                    case 1:
                        imageUploadResponse_1 = _a.sent();
                        console.log('Successful image upload');
                        return [2 /*return*/];
                }
            });
        });
    }
    var user, uploadUrl_1, uploadAuthToken_1, imageUploadResponse_1, imageName, imageUrl, insertImgUrl, values, updateImageUsernames, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                user = req.query.user;
                console.log('$connectedUsername', user);
                if (!req.file) return [3 /*break*/, 7];
                return [4 /*yield*/, authenticate()];
            case 1:
                _a.sent();
                return [4 /*yield*/, imageUpload(req.file.mimetype, req.file.originalname, req.file.buffer)];
            case 2:
                _a.sent();
                imageName = imageUploadResponse_1.data.fileName;
                imageUrl = "https://f004.backblazeb2.com/file/trxmini-games-/".concat(imageName);
                insertImgUrl = "UPDATE usernames SET img = ($1) WHERE username = ($2)";
                values = ["".concat(imageUrl), "".concat(user)];
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, cred_js_1.post.query(insertImgUrl, values)];
            case 4:
                updateImageUsernames = _a.sent();
                console.log('Successfully added avatarimage to user row');
                return [3 /*break*/, 6];
            case 5:
                error_9 = _a.sent();
                console.log(error_9);
                return [3 /*break*/, 6];
            case 6:
                console.log(imageUploadResponse_1);
                console.log(imageName);
                _a.label = 7;
            case 7: return [2 /*return*/];
        }
    });
}); });
app.get('/getavatar', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    function fetchAvatar() {
        return __awaiter(this, void 0, void 0, function () {
            var SELECT, values, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(counter < 1000 && !hasAvatar)) return [3 /*break*/, 5];
                        counter++;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        SELECT = "SELECT img FROM usernames WHERE username = ($1)";
                        values = ["".concat(user)];
                        return [4 /*yield*/, cred_js_1.post.query(SELECT, values)];
                    case 2:
                        selectQuery = _a.sent();
                        hasAvatar = true;
                        return [3 /*break*/, 4];
                    case 3:
                        error_10 = _a.sent();
                        console.log(error_10);
                        return [3 /*break*/, 4];
                    case 4: return [3 /*break*/, 0];
                    case 5: return [2 /*return*/, res.json(selectQuery.rows[0].img)];
                }
            });
        });
    }
    var user, imageUrl, counter, hasAvatar, selectQuery;
    return __generator(this, function (_a) {
        user = req.query.user;
        counter = 0;
        hasAvatar = false;
        setTimeout(fetchAvatar, 3000);
        return [2 /*return*/];
    });
}); });
app.post('/changeusername', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, insertPrevious, value, insert, values, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                user = req.body;
                insertPrevious = "UPDATE usernames SET previous_username=username WHERE address=($1)";
                value = ["".concat(user.address)];
                insert = "UPDATE usernames SET username=($1) WHERE address=($2)";
                values = ["".concat(user.name), "".concat(user.address)];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, cred_js_1.post.query(insertPrevious, value)];
            case 2:
                _a.sent();
                return [4 /*yield*/, cred_js_1.post.query(insert, values)];
            case 3:
                _a.sent();
                console.log('Successfuly changed username to', user.name);
                return [3 /*break*/, 5];
            case 4:
                error_11 = _a.sent();
                console.log(error_11);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
console.log('Listening on port 5001');
app.listen(5001);
