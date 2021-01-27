"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.sendEmail = exports.receiveEmail = void 0;

var _nodemailer = _interopRequireDefault(require("nodemailer"));

var _nodemailerSendgridTransport = _interopRequireDefault(require("nodemailer-sendgrid-transport"));

var _inboundMailParser = _interopRequireDefault(require("@sendgrid/inbound-mail-parser"));

const receiveEmail = async (event, {
  gql,
  log,
  request
}) => {
  const {
    user
  } = await request(gql`
		mutation ($record: UserInput!) {
			user: getOrCreateUser(record: $record) {
				_id
			}
		}
	`, {
    record: {
      email: event.data.body.envelope ? JSON.parse(event.data.body.envelope).from : '',
      name: event.data.body.from
    }
  });
  const data = await request(gql`
		mutation ($message: String, $user: MongoID!) {
			ticket: createTicket(message: $message, user: $user) {
				_id
			}
		}
	`, {
    message: event.data.body.text,
    user: user._id.toString()
  });
  log.info(`🎟  Created Ticket ${data.ticket._id.toString()}`);
};

exports.receiveEmail = receiveEmail;

const sendEmail = async (event, {
  gql,
  log,
  request
}) => {
  const transporter = _nodemailer.default.createTransport((0, _nodemailerSendgridTransport.default)({
    auth: {
      // TODO: get value from plugins model
      api_key: ''
    }
  }));

  const data = await request(gql`
	query ($agent: MongoID!){
		organization {
			name
		}
		
		agent: agentById(_id:$agent) {
			name {
				display
			}
			email
		}
	}
	`, {
    agent: event.data.body.fullDocument.agents[0]
  });
  const {
    name
  } = data.organization;
  const orgName = `${name.charAt(0).toUpperCase()}${name.slice(1)} Support`;
  const to = `${data.agent.name.display} <${data.agent.email}>`;
  await transporter.sendMail({
    from: `${orgName} <${event.organization}@parse.combase.app>`,
    // sender address
    to,
    // list of receivers
    subject: '🎟 You\'ve been assigned a new ticket!',
    // Subject line
    html: `${orgName} • New Ticket: ${event.data._id.toString()}` // html body

  });
  log.info(`✉️  Sent ${event.trigger} Email: ${to}`);
};

exports.sendEmail = sendEmail;