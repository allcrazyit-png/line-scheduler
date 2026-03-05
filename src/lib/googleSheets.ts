import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export async function getSheets() {
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (privateKey) {
        // 處理 Vercel 或環境變數中可能出現的各種換行符號問題
        privateKey = privateKey.replace(/\\n/g, "\n");

        // 有時候 Vercel 會自動幫值加上外層引號，導致 OpenSSL 無法解析，這裡要去掉
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.substring(1, privateKey.length - 1);
        }
    }

    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

    const auth = new google.auth.GoogleAuth({
        credentials: {
            private_key: privateKey,
            client_email: clientEmail,
        },
        scopes: SCOPES,
    });

    return google.sheets({ version: "v4", auth });
}

export async function getSchedules() {
    const sheets = await getSheets();
    const range = "line_schedules!A2:F";
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range,
    });

    const rows = response.data.values || [];
    return rows.map((row) => ({
        id: row[0],
        group: row[1],
        message: row[2],
        scheduledAt: row[3],
        status: row[4],
        createdAt: row[5],
    }));
}

export async function addSchedule(data: {
    id: string;
    group: string;
    message: string;
    scheduledAt: string;
    status: string;
    createdAt: string;
}) {
    const sheets = await getSheets();
    const range = "line_schedules!A:F";
    const values = [
        [data.id, data.group, data.message, data.scheduledAt, data.status, data.createdAt],
    ];

    await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range,
        valueInputOption: "RAW",
        requestBody: { values },
    });
}

export async function deleteSchedule(id: string) {
    const sheets = await getSheets();
    const sheetMetadata = await sheets.spreadsheets.get({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    });
    const sheetId = sheetMetadata.data.sheets?.find(
        (s) => s.properties?.title === "line_schedules"
    )?.properties?.sheetId;

    if (sheetId === undefined) throw new Error("Sheet 'line_schedules' not found");

    const schedules = await getSchedules();
    const rowIndex = schedules.findIndex((s) => s.id === id);

    if (rowIndex === -1) return;

    // rowIndex + 1 because of header
    const rowPos = rowIndex + 1;

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        requestBody: {
            requests: [
                {
                    deleteDimension: {
                        range: {
                            sheetId: sheetId,
                            dimension: "ROWS",
                            startIndex: rowPos,
                            endIndex: rowPos + 1,
                        },
                    },
                },
            ],
        },
    });
}

export async function getHistory() {
    const sheets = await getSheets();
    const range = "line_history!A2:F";
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range,
    });

    const rows = response.data.values || [];
    return rows.map((row) => ({
        id: row[0],
        group: row[1],
        message: row[2],
        status: row[3],
        scheduledAt: row[4],
        sentAt: row[5],
    }));
}

export async function addHistory(data: {
    id: string;
    group: string;
    message: string;
    status: string;
    scheduledAt: string;
    sentAt: string;
}) {
    const sheets = await getSheets();
    const range = "line_history!A:F";
    const values = [
        [data.id, data.group, data.message, data.status, data.scheduledAt, data.sentAt],
    ];

    await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range,
        valueInputOption: "RAW",
        requestBody: { values },
    });
}

export async function updateScheduleStatus(id: string, status: string) {
    const sheets = await getSheets();
    const schedules = await getSchedules();
    const rowIndex = schedules.findIndex((s) => s.id === id);

    if (rowIndex === -1) return;

    // rowIndex + 2 because of header (A1)
    const rowPos = rowIndex + 2;
    const range = `line_schedules!E${rowPos}`;

    await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range,
        valueInputOption: "RAW",
        requestBody: {
            values: [[status]],
        },
    });
}
