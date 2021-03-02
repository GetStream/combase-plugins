export const receiveEmail = async (event, { gql, log, request }) => {
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
	
	log.info(`🎟  Created Ticket ${data.ticket._id.toString()}`)
};

// TODO: Fix up issue with Sendgrid and uncomment this.
export const sendEmail = async (event, { gql, log, request, emailTransport }) => {

	const data = await request(gql`
		query ($organization: MongoID!, $agent: MongoID!){
			organization(_id: $organization) {
				name
			}
			
			agent(_id:$agent) {
				name {
					display
				}
				email
			}
		}
	`, { agent: event.data.body.fullDocument.agents[0], organization: event.organization })
	
	const { name } = data.organization
	
	const orgName = `${name.charAt(0).toUpperCase()}${name.slice(1)} Support`;
	const to = `${data.agent.name.display} <${data.agent.email}>`;

	// await emailTransport.sendMail({
	// 	from: `${orgName} <${event.organization}@parse.combase.app>`, // sender address
	// 	to, // list of receivers
	// 	subject: '🎟 You\'ve been assigned a new ticket!', // Subject line
	// 	html: `${orgName} • New Ticket: ${event.data._id.toString()}`, // html body
	// });
	
	log.info(`✉️  Sent ${event.trigger} Email: ${to} • ${orgName}`);
};
