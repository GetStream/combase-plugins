export default {
	/**
	 * ?  The "Human Readable" name shown in the UI
	 */
	"name": 'Sendbird Plugin',
	"about": "about.md",
	/**
	 * ? The fields presented to the user when they add the plugin to their organization
	 */
	"configuration": {
		"key": {
			"type": "String",
			"inputType": "password",
			"required": true
		},
		"secret": {
			"type": "String",
			"inputType": "password",
			"required": true
		}
	},
	/**
	 * ? Map capn trigger names to exported plugin method names
	 */
	"triggers": {
		"send": "sendEmail",
		"receive": "receiveEmail",
		"combase:chat.archive": "cleanUp"
	},
	/**
	 * ? Dot notation selectors by GraphQL type, to pull in Combase data to the plugin.
	 */
	"fields": {
		"Organization": [
			"stream.key",
			"stream.secret",
			"name",
			"contact.name",
			"contact.email",
		]
	}
}