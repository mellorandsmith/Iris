
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router'
import ReactGA from 'react-ga'

import TrackList from '../components/TrackList'
import Thumbnail from '../components/Thumbnail'
import Dater from '../components/Dater'
import ConfirmationButton from '../components/Fields/ConfirmationButton'
import LazyLoadListener from '../components/LazyLoadListener'
import FollowButton from '../components/Fields/FollowButton'
import Header from '../components/Header'
import ContextMenuTrigger from '../components/ContextMenuTrigger'
import URILink from '../components/URILink'
import Icon from '../components/Icon'

import * as helpers from '../helpers'
import * as coreActions from '../services/core/actions'
import * as uiActions from '../services/ui/actions'
import * as mopidyActions from '../services/mopidy/actions'
import * as spotifyActions from '../services/spotify/actions'

class Playlist extends React.Component{

	constructor(props){
		super(props);
	}

	componentDidMount(){
		this.loadPlaylist();
		this.setWindowTitle();
	}

	componentWillReceiveProps(nextProps){
		if (nextProps.params.uri != this.props.params.uri){
			this.loadPlaylist(nextProps);
		} else if (!this.props.mopidy_connected && nextProps.mopidy_connected){
			if (helpers.uriSource(this.props.params.uri) != 'spotify'){
				this.loadPlaylist(nextProps);
			}
		}

		if (!this.props.playlist && nextProps.playlist){
			this.setWindowTitle(nextProps.playlist);
		}

		if (this.props.params.uri !== nextProps.params.uri && nextProps.playlist){
			this.setWindowTitle(nextProps.playlist);
		}
	}

	setWindowTitle(playlist = this.props.playlist){		
		if (playlist){
			this.props.uiActions.setWindowTitle(playlist.name+" (playlist)");
		} else{
			this.props.uiActions.setWindowTitle("Playlist");
		}
	}

	loadPlaylist(props = this.props){
		
		if (props.playlist && props.playlist.is_completely_loaded){
			console.info('Loading playlist from index')

		} else {
			switch (helpers.uriSource(props.params.uri)){

				case 'spotify':
					this.props.spotifyActions.getPlaylist(props.params.uri);
					this.props.spotifyActions.following(props.params.uri);
					break

				default:
					if (props.mopidy_connected){
						this.props.mopidyActions.getPlaylist(props.params.uri);
					}
					break
			}
		}
	}

	loadMore(){
		this.props.spotifyActions.getMore(
			this.props.playlist.tracks_more,
			{
				parent_type: 'playlist',
				parent_key: this.props.playlist.uri,
				records_type: 'track'
			}
		);
	}

	handleContextMenu(e){
		var data = {
			e: e,
			context: (this.props.playlist.can_edit ? 'editable-playlist' : 'playlist'),
			items: [this.props.playlist],
			uris: [this.props.params.uri]
		}
		this.props.uiActions.showContextMenu(data)
	}

	play(){
        this.props.mopidyActions.playPlaylist(this.props.playlist.uri)
	}

	follow(){
        if (this.props.allow_reporting){
	        ReactGA.event({ category: 'Playlist', action: 'Follow', label: this.props.playlist.uri });
	    }
		this.props.spotifyActions.toggleFollowingPlaylist(this.props.playlist.uri, 'PUT')
	}

	// TODO: Once unfollowing occurs, remove playlist from global playlists list
	unfollow(){
        if (this.props.allow_reporting){
	        ReactGA.event({ category: 'Playlist', action: 'Unfollow', label: this.props.playlist.uri });
	    }
		this.props.spotifyActions.toggleFollowingPlaylist(this.props.playlist.uri, 'DELETE' )
	}

	// TODO: Once deletion occurs, remove playlist from global playlists list
	delete(){
		this.props.mopidyActions.deletePlaylist(this.props.playlist.uri);
	}

	reorderTracks(indexes, index){
		this.props.coreActions.reorderPlaylistTracks(this.props.playlist.uri, indexes, index, this.props.playlist.snapshot_id);
	}

	removeTracks(tracks_indexes){
		this.props.coreActions.removeTracksFromPlaylist(this.props.playlist.uri, tracks_indexes);
	}

	inLibrary(){
		var library = helpers.uriSource(this.props.params.uri)+'_library_playlists';
		return (this.props[library] && this.props[library].indexOf(this.props.params.uri) > -1);
	}

	renderActions(){
		switch(helpers.uriSource(this.props.playlist.uri )){

			case 'm3u':
				return (
					<div className="actions">
						<button className="primary" onClick={ e => this.play() }>Play</button>
						<Link className="button secondary" to={global.baseURL+'playlist/'+encodeURIComponent(this.props.params.uri)+'/edit'}>Edit</Link>
						<ContextMenuTrigger onTrigger={e => this.handleContextMenu(e)} />
					</div>
				)

			case 'spotify':
				if (this.props.playlist.can_edit){
					return (
						<div className="actions">
							<button className="primary" onClick={ e => this.play() }>Play</button>
							<Link className="button secondary" to={global.baseURL+'playlist/'+encodeURIComponent(this.props.params.uri)+'/edit'}>Edit</Link>
							<ContextMenuTrigger onTrigger={e => this.handleContextMenu(e)} />
						</div>
					)
				}
				return (
					<div className="actions">
						<button className="primary" onClick={ e => this.play() }>Play</button>
						<FollowButton className="secondary" uri={this.props.params.uri} addText="Add to library" removeText="Remove from library" is_following={this.inLibrary()} />
						<ContextMenuTrigger onTrigger={e => this.handleContextMenu(e)} />
					</div>
				)

			default:
				return (
					<div className="actions">
						<button className="primary" onClick={ e => this.play() }>Play</button>
						<ContextMenuTrigger onTrigger={e => this.handleContextMenu(e)} />
					</div>
				)
		}
	}

	render(){
		var scheme = helpers.uriSource(this.props.params.uri);
		var user_id = helpers.getFromUri('userid',this.props.params.uri);
		var playlist_id = helpers.getFromUri('playlistid',this.props.params.uri);
		
		if (!this.props.playlist){
			if (helpers.isLoading(this.props.load_queue,['spotify_users/'+user_id+'/playlists/'+playlist_id+'?'])){
				return (
					<div className="body-loader loading">
						<div className="loader"></div>
					</div>
				)
			} else {
				return null;
			}
		}

		var context = 'playlist';
		if (this.props.playlist.can_edit){
			context = 'editable-playlist';
		}

		var tracks = [];
		if (this.props.playlist.tracks_uris && this.props.tracks){
			for (var i = 0; i < this.props.playlist.tracks_uris.length; i++){
				var uri = this.props.playlist.tracks_uris[i]
				if (this.props.tracks.hasOwnProperty(uri)){
					tracks.push(this.props.tracks[uri])
				}
			}
		}

		if (tracks.length <= 0 && helpers.isLoading(this.props.load_queue,['spotify_users/'+user_id+'/playlists/'+playlist_id, 'spotify_users/'+user_id+'/playlists/'+playlist_id+'/tracks'])){
			var is_loading_tracks = true;
		} else {
			var is_loading_tracks = false;
		}

		return (
			<div className="view playlist-view content-wrapper">
				<div className="thumbnail-wrapper">
					<Thumbnail size="large" canZoom images={ this.props.playlist.images } />
				</div>

				<div className="title">
					<h1>{ this.props.playlist.name }</h1>
					{ this.props.playlist.description ? <h2 className="description grey-text" dangerouslySetInnerHTML={{__html: this.props.playlist.description}}></h2> : null }

					<ul className="details">
						{ !this.props.slim_mode ? <li className="has-tooltip"><Icon type="fontawesome" name={helpers.sourceIcon(this.props.params.uri )} /><span className="tooltip">{helpers.uriSource(this.props.params.uri)} playlist</span></li> : null }
						{ this.props.playlist.owner && !this.props.slim_mode ? <li><URILink type="user" uri={this.props.playlist.owner.uri}>{this.props.playlist.owner.id}</URILink></li> : null }
						{ this.props.playlist.followers ? <li>{this.props.playlist.followers.total.toLocaleString()} followers</li> : null }
						{ this.props.playlist.last_modified ? <li>Edited <Dater type="ago" data={this.props.playlist.last_modified} /></li> : null }
						<li>
							{ this.props.playlist.tracks_total ? this.props.playlist.tracks_total : tracks.length} tracks,&nbsp;
							<Dater type="total-time" data={tracks} />
						</li>
					</ul>
				</div>

				{ this.renderActions() }

				<section className="list-wrapper">
					<TrackList uri={this.props.params.uri} className="playlist-track-list" context={context} tracks={tracks} removeTracks={ tracks_indexes => this.removeTracks(tracks_indexes) } reorderTracks={ (indexes, index) => this.reorderTracks(indexes, index) } />
					<LazyLoadListener loading={this.props.playlist.tracks_more} forceLoader={is_loading_tracks} loadMore={() => this.loadMore()}/>
				</section>
			</div>
		)
	}
}


/**
 * Export our component
 *
 * We also integrate our global store, using connect()
 **/

const mapStateToProps = (state, ownProps) => {
	var uri = ownProps.params.uri;
	return {
		allow_reporting: state.ui.allow_reporting,
		slim_mode: state.ui.slim_mode,
		load_queue: state.ui.load_queue,
		tracks: state.core.tracks,
		playlist: (state.core.playlists[uri] !== undefined ? state.core.playlists[uri] : false ),
		spotify_library_playlists: state.spotify.library_playlists,
		local_library_playlists: state.mopidy.library_playlists,
		mopidy_connected: state.mopidy.connected,
		spotify_authorized: state.spotify.authorization,
		spotify_userid: state.spotify.me.id
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		coreActions: bindActionCreators(coreActions, dispatch),
		uiActions: bindActionCreators(uiActions, dispatch),
		mopidyActions: bindActionCreators(mopidyActions, dispatch),
		spotifyActions: bindActionCreators(spotifyActions, dispatch)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Playlist)