import nodemailer from 'nodemailer';
import sgTransport from 'nodemailer-sendgrid-transport';
import sgParse from '@sendgrid/inbound-mail-parser';
import gql from 'graphql-tag';

export const receiveEmail = async (event, { request }) => {
	console.log('📫 New Email:', event);

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
	console.log('🎟 Created Ticket', data.ticket._id.toString())
};

export const sendEmail = async (event, { request }) => {
	console.log('Send Email:', event, event.data.body.fullDocument);

	// const transporter = nodemailer.createTransport(
	// 	sgTransport({
	// 		auth: {
	// 			// TODO: get value from plugins model
	// 			api_key: process.env.SENDGRID_API_KEY,
	// 		},
	// 	})
	// );
	
	// const email = await transporter.sendMail({
	// 	from: '"Fred Foo 👻" <foo@example.com>', // sender address
	// 	to: 'bar@example.com, baz@example.com', // list of receivers
	// 	subject: 'Hello ✔', // Subject line
	// 	html: '<b>Hello world?</b>', // html body
	// });

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
