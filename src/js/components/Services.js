
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { bindActionCreators } from 'redux'

import Thumbnail from './Thumbnail'
import Icon from './Icon'
import URILink from './URILink'
import SpotifyAuthenticationFrame from '../components/Fields/SpotifyAuthenticationFrame'
import LastfmAuthenticationFrame from '../components/Fields/LastfmAuthenticationFrame'
import GeniusAuthenticationFrame from '../components/Fields/GeniusAuthenticationFrame'
import Snapcast from '../components/Snapcast'

import * as uiActions from '../services/ui/actions'
import * as coreActions from '../services/core/actions'
import * as mopidyActions from '../services/mopidy/actions'
import * as pusherActions from '../services/pusher/actions'
import * as spotifyActions from '../services/spotify/actions'
import * as lastfmActions from '../services/lastfm/actions'
import * as geniusActions from '../services/genius/actions'

class Services extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			country: this.props.spotify.country,
			locale: this.props.spotify.locale,
			input_in_focus: null
		}
	}

	componentDidMount(){
		if (this.props.lastfm.session && this.props.core.users["lastfm:user:"+this.props.lastfm.session.name] === undefined){
			this.props.lastfmActions.getMe();
		}
		if (this.props.genius.me && this.props.core.users["genius:user:"+this.props.genius.me.id] === undefined){
			this.props.geniusActions.getMe();
		}
	}
	componentWillReceiveProps(newProps){
		var changed = false
		var state = this.state

		if (newProps.spotify.country != this.state.country && this.state.input_in_focus != 'country'){
			state.country = newProps.spotify.country
			changed = true
		}

		if (newProps.spotify.locale != this.state.locale && this.state.input_in_focus != 'locale'){
			state.locale = newProps.spotify.locale
			changed = true
		}

		if (changed){
			this.setState(state)
		}
	}

	handleBlur(name, value){
		this.setState({input_in_focus: null})
		var data = {}
		data[name] = value
		this.props.coreActions.set(data)
	}

	renderSpotify(){
		var share_authorization_button = null;
		if (this.props.spotify.authorization){
			share_authorization_button = (
				<Link className="button" to={global.baseURL+'settings/share-authorization'}>
					Share authorization
				</Link>
			);
		}

		var user_object = this.props.spotify.me;
		if (user_object){
			var user = (
				<URILink className="user" type="user" uri={user_object.uri}>
					<Thumbnail circle={true} size="small" images={user_object.images} />
					<span className="user-name">
						{user_object.display_name ? user_object.display_name : user_object.id}
						{!this.props.spotify.authorization ? <span className="grey-text">&nbsp;&nbsp;(Limited access)</span> : null}
					</span>
				</URILink>
			)
		} else {
			var user = (
				<URILink className="user">
					<Thumbnail circle={true} size="small" />
					<span className="user-name">
						Unknown
					</span>
				</URILink>
			)
		}

		var not_installed = null;

		if (!this.props.mopidy.uri_schemes || !this.props.mopidy.uri_schemes.includes('spotify:')){
			not_installed = (
				<div>
					<p className="message warning"><em>Mopidy-Spotify</em> extension is not running - you will not be able to play any Spotify tracks</p>
					<br />
				</div>
			);
		}

		return (
			<div>
				{not_installed}
				<div className="field">
					<div className="name">Country</div>
					<div className="input">
						<input
							type="text"
							onChange={e => this.setState({country: e.target.value})}
							onFocus={e => this.setState({input_in_focus: 'country'})}
							onBlur={e => this.props.spotifyActions.set({country: e.target.value})}
							value={ this.state.country } />
						<div className="description">
							An <a href="http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2" target="_blank">ISO 3166-1 alpha-2</a> country code (eg <em>NZ</em>)
						</div>
					</div>
				</div>
				<div className="field">
					<div className="name">Locale</div>
					<div className="input">
						<input
							type="text"
							onChange={e => this.setState({locale: e.target.value})}
							onFocus={e => this.setState({input_in_focus: 'locale'})}
							onBlur={e => this.props.spotifyActions.set({locale: e.target.value})}
							value={this.state.locale} />
						<div className="description">
							Lowercase <a href="http://en.wikipedia.org/wiki/ISO_639" target="_blank">ISO 639 language code</a> and an uppercase <a href="http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2" target="_blank">ISO 3166-1 alpha-2 country code</a>, joined by an underscore (eg <em>en_NZ</em>)
						</div>
					</div>
				</div>

				<div className="field current-user">
					<div className="name">Current user</div>
					<div className="input">
						<div className="text">
							{user}
						</div>
					</div>
				</div>

				<div className="field">
					<div className="name">Authorization</div>
					<div className="input">
						<SpotifyAuthenticationFrame />
						{share_authorization_button}
						{this.props.spotify.refreshing_token ? <button className="working">Refreshing...</button> : <button onClick={e => this.props.spotifyActions.refreshingToken()}>Force token refresh</button>}
					</div>
				</div>
			</div>
		);
	}

	renderLastfm(){
		var user_object = (this.props.lastfm.me ? this.props.core.users["lastfm:user:"+this.props.lastfm.me.name] : null);
		if (user_object){
			var user = (
				<span className="user">
					<Thumbnail circle={true} size="small" images={user_object.image} />
					<span className="user-name">
						{user_object.realname ? user_object.realname : user_object.name}
					</span>
				</span>
			)
		} else {
			var user = (
				<span className="user">
					<Thumbnail circle={true} size="small" />
					<span className="user-name">
						Unknown
					</span>
				</span>
			)
		}

		return (
			<div>
				{this.props.lastfm.session ? <div className="field current-user">
					<div className="name">Current user</div>
					<div className="input">
						<div className="text">
							{user}
						</div>
					</div>
				</div> : null}

				<div className="field">
					<div className="name">Authorization</div>
					<div className="input">
						<LastfmAuthenticationFrame />
					</div>
				</div>
			</div>
		);
	}

	renderGenius(){
		var user_object = (this.props.genius.me ? this.props.core.users["genius:user:"+this.props.genius.me.id] : null);
		if (user_object){
			var user = (
				<span className="user">
					<Thumbnail circle={true} size="small" images={user_object.avatar} />
					<span className="user-name">
						{user_object.name}
					</span>
				</span>
			)
		} else {
			var user = (
				<span className="user">
					<Thumbnail circle={true} size="small" />
					<span className="user-name">
						Unknown
					</span>
				</span>
			)
		}

		return (
			<div>
				{this.props.genius.authorization ? <div className="field current-user">
					<div className="name">Current user</div>
					<div className="input">
						<div className="text">
							{user}
						</div>
					</div>
				</div> : null}

				<div className="field">
					<div className="name">Authorization</div>
					<div className="input">
						<GeniusAuthenticationFrame />
					</div>
				</div>
			</div>
		);
	}

	renderIcecast(){
		return (
			<div>
				<div className="field checkbox">
					<div className="name">Enable</div>
					<div className="input">
						<label>
							<input
								type="checkbox"
								name="ssl"
								checked={this.props.core.http_streaming_enabled}
								onChange={e => this.props.coreActions.set({http_streaming_enabled: !this.props.core.http_streaming_enabled})} />
							<span className="label">
								Stream audio to this browser
							</span>
						</label>
					</div>
				</div>
				<div className="field">
					<div className="name">Location</div>
					<div className="input">
						<input
							type="text"
							onChange={e => this.props.coreActions.set({http_streaming_url: e.target.value})}
							value={this.props.core.http_streaming_url} />
						<div className="description">
							The full URL to your stream endpoint
						</div>
					</div>
				</div>
			</div>
		);
	}

	renderMenu(){

		if (this.props.spotify.me){
			var spotify_icon = <Thumbnail circle={true} size="small" images={this.props.spotify.me.images} />
		} else {
			var spotify_icon = <Thumbnail circle={true} size="small" />
		}

		if (this.props.lastfm.me && this.props.core.users["lastfm:user:"+this.props.lastfm.me.name]){
			var lastfm_icon = <Thumbnail circle={true} size="small" images={this.props.core.users["lastfm:user:"+this.props.lastfm.me.name].image} />
		} else {
			var lastfm_icon = <Icon type="fontawesome" name="lastfm" />
		}

		if (this.props.genius.me && this.props.core.users["genius:user:"+this.props.genius.me.id]){
			var genius_icon = <Thumbnail circle={true} size="small" images={this.props.core.users["genius:user:"+this.props.genius.me.id].avatar} />
		} else {
			var genius_icon = <Icon name="genius" type="svg" />
		}

		return (
			<div className="menu">
				<div className="menu-item-wrapper">
					<Link className={"menu-item"+(this.props.active == 'spotify' ? ' active' : '')} to={this.props.active == 'spotify' ? global.baseURL+'settings' : global.baseURL+'settings/service/spotify'}>
						{spotify_icon}
						<div className="title">
							Spotify
						</div>
						{this.props.spotify.authorization ? <span className="status green-text">Authorized</span> : <span className="status grey-text">Read-only</span>}
					</Link>
				</div>
				<div className="menu-item-wrapper hidden">
					<Link className={"menu-item"+(this.props.active == 'lastfm' ? ' active' : '')} to={this.props.active == 'lastfm' ? global.baseURL+'settings' : global.baseURL+'settings/service/lastfm'}>
						{lastfm_icon}
						<div className="title">
							LastFM
						</div>
						{this.props.lastfm.session ? <span className="status green-text">Authorized</span> : <span className="status grey-text">Read-only</span>}
					</Link>
				</div>
				<div className="menu-item-wrapper hidden">
					<Link className={"menu-item"+(this.props.active == 'genius' ? ' active' : '')} to={this.props.active == 'genius' ? global.baseURL+'settings' : global.baseURL+'settings/service/genius'}>
						{genius_icon}
						<div className="title">
							Genius
						</div>
						{this.props.genius.authorization ? <span className="status green-text">Authorized</span> : <span className="status grey-text">Unauthorized</span>}
					</Link>
				</div>
				<div className="menu-item-wrapper hidden">
					<Link className={"menu-item"+(this.props.active == 'snapcast' ? ' active' : '')} to={this.props.active == 'snapcast' ? global.baseURL+'settings' : global.baseURL+'settings/service/snapcast'}>
						<Icon name="devices" />
						<div className="title">
							Snapcast
						</div>
						{this.props.pusher.config.snapcast_enabled ? <span className="status green-text">Enabled</span> : <span className="status grey-text">Disabled</span>}
					</Link>
				</div>
				<div className="menu-item-wrapper hidden">
					<Link className={"menu-item"+(this.props.active == 'icecast' ? ' active' : '')} to={this.props.active == 'icecast' ? global.baseURL+'settings' : global.baseURL+'settings/service/icecast'}>
						<Icon name="wifi_tethering" />
						<div className="title">
							Icecast
						</div>
						{this.props.core.http_streaming_enabled ? <span className="status green-text">Enabled</span> : <span className="status grey-text">Disabled</span>}
					</Link>
				</div>
			</div>
		);
	}

	renderService(){
		var service = null;
		switch (this.props.active){
			case 'spotify':
				service = this.renderSpotify();
				break;
			case 'lastfm':
				service = this.renderLastfm();
				break;
			case 'genius':
				service = this.renderGenius();
				break;
			case 'icecast':
				service = this.renderIcecast();
				break;
			case 'snapcast':
				service = <Snapcast />
				break;
		}

		if (service){
			return (
				<div className="service">
					{service}
				</div>
			);
		} else {
			return null;
		}
	}

	render(){
		return (
			<div className="services">
				{this.renderMenu()}
				{this.renderService()}
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	return state
}

const mapDispatchToProps = (dispatch) => {
	return {
		coreActions: bindActionCreators(coreActions, dispatch),
		uiActions: bindActionCreators(uiActions, dispatch),
		pusherActions: bindActionCreators(pusherActions, dispatch),
		mopidyActions: bindActionCreators(mopidyActions, dispatch),
		spotifyActions: bindActionCreators(spotifyActions, dispatch),
		lastfmActions: bindActionCreators(lastfmActions, dispatch),
		geniusActions: bindActionCreators(geniusActions, dispatch)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Services)
