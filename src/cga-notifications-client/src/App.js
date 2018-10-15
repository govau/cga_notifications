import React, { Component } from "react";

class App extends Component {
	constructor(props) {
		super(props);

		this.state = { users: [], to: "", subject: "", message: "" };
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	/**
	 * Post form data to cga-notifications-email module
	 * @param {*} event 
	 */
	handleSubmit(event) {
		event.preventDefault();
		fetch("http://127.0.0.1:4125/v0/send", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ to: this.state.to, subject: this.state.subject, message: this.state.message })
		})
	}

	/**
	 * Map form event fields to state
	 * @param {} event 
	 */
	handleChange(event) {
		event.preventDefault();
		this.setState({ [event.target.name]: event.target.value });
	}

	async componentDidMount() {
		this.setState({ users: await this.fetchUsers() });
	}

	/**
	 * Fetch users from local CF instance /v2/api
	 * @see https://apidocs.cloudfoundry.org/5.1.0/users/list_all_users.html
	 */
	fetchUsers() {
		return fetch("http://127.0.0.1:4123/v0/cf/users", {
			method: "GET",
		})
			.then(response => {
				return response.json();
			})
			.catch(err => {
				console.error(err);
			});
	}

	/**
	 * Filter and validate username entries in the form of email address
	 * @param {Array} users - List of users fetched from CF endpoint
	 */
	filterUsers(users) {
		return users.filter(item =>
			item.user.username !== undefined
		).filter(item =>
			/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(item.user.username)
		).map((ele, index) => {
			return (
				<option key={index} value={ele.user.username}>{ele.user.username}</option>);
		})
	}

	render() {
		return (
			<main className="app">
				<form onSubmit={this.handleSubmit}>
					<fieldset>
						<legend>Notify cloud users</legend>
						<label>To:</label>
						<select
							name="to"
							onChange={this.handleChange}
							value={this.state.to}
						>
							{this.filterUsers(this.state.users)}
						</select>
						<br />
						<label>
							Subject:
						<input
								type="text"
								onChange={this.handleChange}
								name="subject"
							/>
						</label>
						<br />
						<label>
							Message:
						<textarea
								type="text"
								onChange={this.handleChange}
								name="message"
							/>
						</label>
						<br />
						<input type="submit" value="Submit" />
					</fieldset>
				</form>
			</main>
		);
	}
}

export default App;
