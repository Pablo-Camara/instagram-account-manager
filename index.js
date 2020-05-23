window.igMasterTool = {
	accountsData: {},
	queryHashes: {
		getFollowers: 'c76146de99bb02f6415203be841dd25a',
		getFollowing: 'd04b0a864b4b54837c0d870b0e77e076'
	},
	getQueryUrl: function(queryHash,variables){
		return 'https://www.instagram.com/graphql/query/?query_hash=' + queryHash + '&variables=' + variables;
	},
	getUnfollowUrl: function(accountId){
		return 'https://www.instagram.com/web/friendships/' + accountId + '/unfollow/';
	},
	initialize: function(){
		this.addAccount('camara.pt','31680581864');
	/* 	this.addAccount('edge.of.the.raw.moment','35537458504'); */
	
		this.getDataForAllAccounts();
	},
	addAccount: function(username,accountId){

		this.accountsData[username] = {
			id: accountId,
			username: username,
			followers: {
				list: [],
				fetchInfo: {
					hasNextPage: null,
					endCursor: null
				}
			},
			following: {
				list: [],
				fetchInfo: {
					hasNextPage: null,
					endCursor: null
				}
			},
			accountsNotFollowingBack: [],
			unfollowAttempts: []
		};
	},
	getDataForAllAccounts: function(){
		for (var username in this.accountsData) {
		    if (Object.prototype.hasOwnProperty.call(this.accountsData, username)) {
		        this.getFollowers(username);
		        this.getFollowing(username);
		    }
		}
	},
	getFollowers: function(username,after){
		const variables = '{"id":"'+this.accountsData[username].id+'", "first": 50'+ (typeof after === "string" ? ', "after": "'+after+'"' : '') +'}';
		const url = this.getQueryUrl(this.queryHashes.getFollowers,variables);
		fetch(url).then(function(data){
		    const reader = data.body.getReader();
			reader.read().then(({value}) => {
					var result = new TextDecoder("utf-8").decode(value);
					try {
						const jsonResult = JSON.parse(result);
						const followers = jsonResult.data.user.edge_followed_by;

						if( !(typeof window.igMasterTool.accountsData[username] === 'object') ){
							window.igMasterTool.addAccount(username);
						}
				
						window.igMasterTool.accountsData[username].followers.list.push.apply(
							window.igMasterTool.accountsData[username].followers.list,
							Array.from(followers.edges)
						);

						// TODO: Better way to show feedback to the user using the script:
						console.log('Total followers for account '+ username +' collected so far: ' + window.igMasterTool.accountsData[username].followers.list.length);
						

						if(followers.page_info.end_cursor){
							window.igMasterTool.accountsData[username].followers.fetchInfo.endCursor = followers.page_info.end_cursor;
						}
						
						if(followers.page_info.has_next_page){
							window.igMasterTool.accountsData[username].followers.fetchInfo.hasNextPage = true;

							// TODO: Better way to show feedback to the user using the script:
							console.log('Fetching next followers page for account '+ username +'..')

							setTimeout(function(){
								window.igMasterTool.getFollowers(
									username,
									window.igMasterTool.accountsData[username].followers.fetchInfo.endCursor
								);
							}, 2000);
						} else {
							// if hasNextPage === true then still fetching
							window.igMasterTool.accountsData[username].followers.fetchInfo.hasNextPage = null;

							// Must reset endCursor so we are able to re-fetch followers from scratch:
							window.igMasterTool.accountsData[username].followers.fetchInfo.endCursor = null;

							// TODO: Better way to show feedback to the user using the script:
							console.log('Done fetching followers for account '+ username +'!!');
						}
					} catch(err){
						setTimeout(function(){
								window.igMasterTool.getFollowers(
									username,
									window.igMasterTool.accountsData[username].followers.fetchInfo.endCursor
								);
						}, 1000);

						// TODO: Better way to show feedback to the user using the script:
						console.log('Failed attempt..No worries..This is normal..Retrying..( Account '+ username +' )');
					}
			});
		});
	},
	getFollowing: function(username,after){
		const variables = '{"id":"'+this.accountsData[username].id+'", "first": 50'+ (typeof after === "string" ? ', "after": "'+after+'"' : '') +'}';
		const url = this.getQueryUrl(this.queryHashes.getFollowing,variables);
		fetch(url).then(function(data){
		    const reader = data.body.getReader();
			reader.read().then(({value}) => {
					var result = new TextDecoder("utf-8").decode(value);
					try {
						const jsonResult = JSON.parse(result);
						const following = jsonResult.data.user.edge_follow;

						if( !(typeof window.igMasterTool.accountsData[username] === 'object') ){
							window.igMasterTool.addAccount(username);
						}
				
						window.igMasterTool.accountsData[username].following.list.push.apply(
							window.igMasterTool.accountsData[username].following.list,
							Array.from(following.edges)
						);

						// TODO: Better way to show feedback to the user using the script:
						console.log('Total accounts that '+ username +' follows collected so far: ' + window.igMasterTool.accountsData[username].following.list.length);
						

						if(following.page_info.end_cursor){
							window.igMasterTool.accountsData[username].following.fetchInfo.endCursor = following.page_info.end_cursor;
						}
						
						if(following.page_info.has_next_page){
							window.igMasterTool.accountsData[username].following.fetchInfo.hasNextPage = true;

							// TODO: Better way to show feedback to the user using the script:
							console.log('Fetching next page for the accounts the user ' + username + ' is following..')

							setTimeout(function(){
								window.igMasterTool.getFollowing(
									username,
									window.igMasterTool.accountsData[username].following.fetchInfo.endCursor
								);
							}, 2000);
						} else {
							// if hasNextPage === true then still fetching
							window.igMasterTool.accountsData[username].following.fetchInfo.hasNextPage = null;

							// Must reset endCursor so we are able to re-fetch following accs from scratch:
							window.igMasterTool.accountsData[username].following.fetchInfo.endCursor = null;

							// TODO: Better way to show feedback to the user using the script:
							console.log('Done fetching accounts that the user '+ username +' follows!!');
						}
					} catch(err){
						setTimeout(function(){
								window.igMasterTool.getFollowing(
									username,
									window.igMasterTool.accountsData[username].following.fetchInfo.endCursor
								);
						}, 1000);

						// TODO: Better way to show feedback to the user using the script:
						console.log('Failed attempt..No worries..This is normal..Retrying.. ( Account '+ username +' )');
					}
			});
		});
	},
	getUsersNotFollowingBack: function(username,attemptToUnfollowUnfollowers){
		var accountsNotFollowingBack = [];
		for(var x = 0; x < this.accountsData[username].following.list.length; x++){
			var userBeingFollowed = this.accountsData[username].following.list[x].node;
			var followsBack = false;
			// For each user that I follow, I will check if he also is in my followers list:
			for(var y = 0; y < this.accountsData[username].followers.list.length; y++){
				var userFollowingBack = this.accountsData[username].followers.list[y].node;
				if(userBeingFollowed.username === userFollowingBack.username){
					followsBack = true;
					break;
				}
			}

			if(false === followsBack){
				accountsNotFollowingBack.push(userBeingFollowed);
				continue;
			}
		}
		this.accountsData[username].accountsNotFollowingBack = accountsNotFollowingBack;

		
		if(attemptToUnfollowUnfollowers){
			for(var z = 0; z < accountsNotFollowingBack.length; z++){
				//TODO: Better way to show the feedback to the user using my script 
				const secondsBetweenUnfollows = 30000;
				console.log('Will attempt to unfollow: ' + accountsNotFollowingBack[z].username + ' in ' + (((z+1) * secondsBetweenUnfollows)/1000)) + ' second(s)..';
				setTimeout(window.igMasterTool.unfollowAccount,z * secondsBetweenUnfollows,accountsNotFollowingBack[z],username); 
			}
		}
	},
	unfollowAccount(accountToUnfollow,usernameFromUnfollower){
		const url = window.igMasterTool.getUnfollowUrl(accountToUnfollow.id);
		fetch(url,{
			"headers": {
				"X-CSRFToken": "x5nXAfhzVsjAoNX0b5jSysr3JYjgotud"
			},
			"method": "POST"
		}).then(function(response){
			return response.json();
		}).then(function(data){
			window.igMasterTool.accountsData[usernameFromUnfollower].unfollowAttempts.push({
				account: accountToUnfollow,
				result: data
			});
			// TODO: Improve feed back: create gui through javascript
			if(data.status == 'ok'){
				console.log('Unfollowed < ' + accountToUnfollow.username + ' > successfully.');
				return;
			} 

			console.log('Failed to unfollow < ' + accountToUnfollow.username + ' >.');
		});
	}
};
