import nodemailer from 'nodemailer';
import sgTransport from 'nodemailer-sendgrid-transport';
import sgParse from '@sendgrid/inbound-mail-parser';
import gql from 'graphql-tag';

export const receiveEmail = (event, { request }) => {
	const organization = event.data.body.to.split('@')[0]
	console.log('📫 New Email:');
	console.log('📫 Org:', organization);
};

export const sendEmail = async (event, { request }) => {
	const transporter = nodemailer.createTransport(
		sgTransport({
			auth: {
				// TODO: get value from plugins model
				api_key: process.env.SENDGRID_API_KEY,
			},
		})
	);
	
	const email = await transporter.sendMail({
		from: '"Fred Foo 👻" <foo@example.com>', // sender address
		to: 'bar@example.com, baz@example.com', // list of receivers
		subject: 'Hello ✔', // Subject line
		html: '<b>Hello world?</b>', // html body
	});

	console.log(event, c);
	// await request(
	// 	gql`
	// 		query getEmailAddresses {
	// 			user(_id: $userId) {
	// 				email
	// 			}
	// 			agent(_id: $agentId) {
	// 				email
	// 			}
	// 		}
	// 	`,
	// );
};
