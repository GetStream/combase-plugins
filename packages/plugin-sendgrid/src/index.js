import nodemailer from 'nodemailer';
import sgTransport from 'nodemailer-sendgrid-transport';
import sgParse from '@sendgrid/inbound-mail-parser';
import gql from 'graphql-tag';

export const receiveEmail = async (event, { request }) => {
	const {user} = await request(gql`
		mutation ($record: UserInput!) {
			user: getOrCreateUser(record: $record) {
				_id
			}
		}
	`, 
		{
			record: {
				email: event.data.body.envelope ? JSON.parse(event.data.body.envelope).from : '',
				name: event.data.body.from,
			}
		}
	);

	const data = await request(gql`
		mutation ($message: String, $user: MongoID!) {
			ticket: createTicket(message: $message, user: $user) {
				_id
			}
		}
	`, {
		message: event.data.body.text,
		user: user._id.toString(),
	});

	console.log('🎟  Created Ticket', data.ticket._id.toString())
};

export const sendEmail = async (event, { request }) => {
	
	const transporter = nodemailer.createTransport(
		sgTransport({
			auth: {
				// TODO: get value from plugins model
				api_key: '',
			},
		})
	);
	
	const to = 'Luke <luke@getstream.io>';

	await transporter.sendMail({
		from: 'Combase <@combase.app>', // sender address
		to, // list of receivers
		subject: '🎟 You\'ve been assigned a new ticket!', // Subject line
		html: `New Ticket: ${event.data._id.toString()}`, // html body
	});
	
	console.log(`✉️  Sent ${event.trigger} Email: ${to}`);
	// console.log(event, c);
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
