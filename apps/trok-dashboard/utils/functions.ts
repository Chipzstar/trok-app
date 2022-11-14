import CryptoJS from 'crypto-js';
import { apiClient, companyHouseClient } from './clients';
import dayjs from 'dayjs';

interface selectInput {
	value: string;
	label: string;
}

export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function sanitize(str: string): string {
	return str.replace(/[_-]/g, ' ').toLowerCase();
}

export function uniqueArray(array: selectInput[], key) {
	return [...new Map(array.map(item => [item[key], item])).values()];
}

export function decryptPassword(password: string) {
	let decryptedPassword = '';
	if (password) {
		const bytes = CryptoJS.AES.decrypt(password, process.env.ENC_SECRET);
		decryptedPassword = JSON.parse(bytes.toString());
	}
	return decryptedPassword;
}

export async function uploadFile(file, crn, documentType) {
	try {
		console.table({ file, crn, documentType });
		const filename = encodeURIComponent(file.name);
		const res = (await apiClient.get(`/server/gcp/upload?crn=${crn}&filename=${filename}&type=${documentType}`))
			.data;
		const { url, fields } = res;
		const formData = new FormData();

		Object.entries({ ...fields, file }).forEach(([key, value]: [string, string]) => {
			formData.append(key, value);
		});
		console.log(formData);

		const upload = await fetch(url, {
			method: 'POST',
			body: formData
		});

		if (upload.ok) {
			console.log('Uploaded successfully!');
			console.log(upload);
			return upload;
		} else {
			console.error('Upload failed.', upload.status);
			return upload;
		}
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function validateCRN(crn: string): Promise<boolean> {
	try {
		// if in local development, always return true
		if (process.env.NODE_ENV === 'development') {
			return true;
		}
		const company_profile = await companyHouseClient.get(`/company/${crn}`);
		console.log(company_profile)
		return !!company_profile;
	} catch (err) {
		return false;
	}
}
//@ts-ignore
export function filterByTimeRange(data, range: [Date, Date]) {
	const startDate = dayjs(range[0]).startOf('day');
	const endDate = dayjs(range[1]).endOf('day');
	// @ts-ignore
	return data.filter(t => {
		const curr = dayjs(t.created_at);
		return curr.isBefore(endDate) && curr.isAfter(startDate);
	});
}

export function text({ url, full_name }) {
	return (
		`Hey, ${full_name}!\n` +
		'\n' +
		'To verify your email with Trok, simply click on the link below or paste it into the url field on your favourite browser: This link is only valid for the next 24 hours.\n' +
		'\n' +
		url +
		'\n' +
		'\n' +
		"We're here to help\n" +
		'\n' +
		'If you have any questions or want more information, drop us a message at hello@trok.co.\n' +
		'\n' +
		'- The Trok Team\n' +
		'\n' +
		'© 2022 Trok. All rights reserved.\n'
	);
}

export function html({ url, full_name }) {
	return `<!DOCTYPE html>
<html>
<head>
    <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title></title>

    <!--[if !mso]><!-->
    <style type='text/css'>
@import url('https://fonts.mailersend.com/css?family=Inter:400,600');
    </style>
    <!--<![endif]-->

    <style type='text/css' rel='stylesheet' media='all'>
@media only screen and (max-width: 640px) {

        .ms-header {
            display: none !important;
        }
        .ms-content {
            width: 100% !important;
            border-radius: 0;
        }
        .ms-content-body {
            padding: 30px !important;
        }
        .ms-footer {
            width: 100% !important;
        }
        .mobile-wide {
            width: 100% !important;
        }
        .info-lg {
            padding: 30px;
        }
    }
    </style>
    <!--[if mso]>
            <style type="text/css">
            body { font-family: Arial, Helvetica, sans-serif!important  !important; }
            td { font-family: Arial, Helvetica, sans-serif!important  !important; }
            td * { font-family: Arial, Helvetica, sans-serif!important  !important; }
            td p { font-family: Arial, Helvetica, sans-serif!important  !important; }
            td a { font-family: Arial, Helvetica, sans-serif!important  !important; }
            td span { font-family: Arial, Helvetica, sans-serif!important  !important; }
            td div { font-family: Arial, Helvetica, sans-serif!important  !important; }
            td ul li { font-family: Arial, Helvetica, sans-serif!important  !important; }
            td ol li { font-family: Arial, Helvetica, sans-serif!important  !important; }
            td blockquote { font-family: Arial, Helvetica, sans-serif!important  !important; }
            th * { font-family: Arial, Helvetica, sans-serif!important  !important; }
            </style>
            <![endif]-->
</head>
<body style="font-family:'Inter', Helvetica, Arial, sans-serif; width: 100% !important; height: 100%; margin: 0; padding: 0; -webkit-text-size-adjust: none; background-color: #f4f7fa; color: #4a5566;">

    <div class='preheader' style='display:none !important;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;'></div>

    <table class='ms-body' width='100%' cellpadding='0' cellspacing='0' role='presentation' style='border-collapse:collapse;background-color:#f4f7fa;width:100%;margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;'>
        <tr>
            <td align='center' style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;">

                <table class='ms-container' width='100%' cellpadding='0' cellspacing='0' style='border-collapse:collapse;width:100%;margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;'>
                    <tr>
                        <td align='center' style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;">

                            <table class='ms-header' width='100%' cellpadding='0' cellspacing='0' style='border-collapse:collapse;'>
                                <tr>
                                    <td height='40' style="font-size:0px;line-height:0px;word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;">
                                        &nbsp;
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                    <tr>
                        <td align='center' style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;">

                            <table class='ms-content' width='640' cellpadding='0' cellspacing='0' role='presentation' style='border-collapse:collapse;width:640px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;background-color:#FFFFFF;border-radius:6px;box-shadow:0 3px 6px 0 rgba(0,0,0,.05);'>
                                <tr>
                                    <td class='ms-content-body' style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;padding-top:40px;padding-bottom:40px;padding-right:50px;padding-left:50px;">

                                        <p class='logo' style='margin-right:0;margin-left:0;line-height:28px;font-weight:600;font-size:21px;color:#111111;text-align:center;margin-top:0;margin-bottom:40px;'>
                                            <span style='color:#0052e2;font-family:Arial, Helvetica, sans-serif;font-size:30px;vertical-align:bottom;'>Trok</span>
                                        </p>

                                        <h1 style='font-family:Arial, Helvetica, sans-serif;margin-top:0;color:#111111;font-size:24px;line-height:36px;font-weight:600;margin-bottom:24px;'>Hey, ${full_name}!</h1>

                                        <p style='color:#4a5566;margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;font-size:16px;line-height:28px;'>
                                            To verify your email with Trok, simply click on the link below or paste it into the url field on your favourite browser: This link is only valid for the next 24 hours.
                                        </p>

                                        <table width='100%' align='center' cellpadding='0' cellspacing='0' role='presentation' style='border-collapse:collapse;'>
                                            <tr>
                                                <td align='center' style="padding-top:20px;padding-bottom:20px;padding-right:0;padding-left:0;word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;">

                                                    <table class='mobile-wide' border='0' cellspacing='0' cellpadding='0' role='presentation' style='border-collapse:collapse;'>
                                                        <tr>
                                                            <td align='center' class='btn' style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;background-color:#0052e2;box-shadow:0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -1px rgba(0,0,0,.06);border-radius:3px;">
                                                                <a href='${url}' target='_blank' style='background-color:#0052e2;padding-top:14px;padding-bottom:14px;padding-right:30px;padding-left:30px;display:inline-block;color:#FFF;text-decoration:none;border-radius:3px;-webkit-text-size-adjust:none;box-sizing:border-box;border-width:0px;border-style:solid;border-color:#0052e2;font-weight:600;font-size:15px;line-height:21px;letter-spacing:0.25px;'>Login</a>
                                                            </td>
                                                        </tr>
                                                    </table>

                                                </td>
                                            </tr>
                                        </table>
                                        <p style='color:#4a5566;margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;font-size:16px;line-height:28px;'>
                                            We're here to help
                                        </p>

                                        <p style='color:#4a5566;margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;font-size:16px;line-height:28px;'>
                                            If you have any questions or want more information, drop us a message at <a href='mailto:hello@trok.co'>hello@trok.co</a>.
                                        </p>

                                        <p style='color:#4a5566;margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;font-size:16px;line-height:28px;'>
                                            Cheers,
                                            <br>The Trok Team
                                        </p>
                                        <table width='100%' style='border-collapse:collapse;'>
                                            <tr>
                                                <td height='20' style="font-size:0px;line-height:0px;word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;">
                                                    &nbsp;
                                                </td>
                                            </tr>
                                            <tr>
                                                <td height='20' style="font-size:0px;line-height:0px;border-top-width:1px;border-top-style:solid;border-top-color:#e2e8f0;word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;">
                                                    &nbsp;
                                                </td>
                                            </tr>
                                        </table>

                                        <p class='small' style='color:#4a5566;margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;font-size:14px;line-height:21px;'>
                                            If you’re having trouble with the button above, copy and paste the URL below into your web browser.
                                        </p>
                                        <p class='small' style='color:#4a5566;margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;font-size:14px;line-height:21px;'>
                                            ${url}
                                        </p>

                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                    <tr>
                        <td align='center' style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;">

                            <table class='ms-footer' width='640' cellpadding='0' cellspacing='0' role='presentation' style='border-collapse:collapse;width:640px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;'>
                                <tr>
                                    <td class='ms-content-body' align='center' style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;padding-top:40px;padding-bottom:40px;padding-right:50px;padding-left:50px;">
                                        <p class='small' style='margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;color:#96a2b3;font-size:14px;line-height:21px;'>
                                            &copy; 2020 Trok. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>

</body>
</html>`;
}

