window.igMasterTool = {
	accountsData: {},
	queryHashes: {
		getFollowers: 'c76146de99bb02f6415203be841dd25a',
		getFollowing: 'd04b0a864b4b54837c0d870b0e77e076'
	},
	getQueryUrl: function(queryHash,variables){
		return 'https://www.instagram.com/graphql/query/?query_hash=' + queryHash + '&variables=' + variables;
	},
	initialize: function(){
		this.addAccount('31680581864','camara.pt');
		this.addAccount('35537458504','edge.of.the.raw.moment');
		
	
		this.getDataForAllAccounts();
	},
	addAccount: function(accountId,username = null){
		if(!accountId){
			alert('Account ID required!!');
			return;
		}

		this.accountsData[accountId] = {
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
			accountsNotFollowingBack: []
		};
	},
	getDataForAllAccounts: function(){
		for (var accountId in this.accountsData) {
		    if (Object.prototype.hasOwnProperty.call(this.accountsData, accountId)) {
		        this.getFollowers(accountId);
		        this.getFollowing(accountId);
		    }
		}
	},
	getFollowers: function(accountId,after){
		const variables = '{"id":"'+accountId+'", "first": 50'+ (typeof after === "string" ? ', "after": "'+after+'"' : '') +'}';
		const url = this.getQueryUrl(this.queryHashes.getFollowers,variables);
		fetch(url).then(function(data){
		    const reader = data.body.getReader();
			reader.read().then(({value}) => {
					var result = new TextDecoder("utf-8").decode(value);
					try {
						const jsonResult = JSON.parse(result);
						const followers = jsonResult.data.user.edge_followed_by;

						if( !(typeof window.igMasterTool.accountsData[accountId] === 'object') ){
							window.igMasterTool.addAccount(accountId);
						}
				
						window.igMasterTool.accountsData[accountId].followers.list.push.apply(
							window.igMasterTool.accountsData[accountId].followers.list,
							Array.from(followers.edges)
						);

						// TODO: Better way to show feedback to the user using the script:
						console.log('Total followers for account '+ window.igMasterTool.accountsData[accountId].username +' collected so far: ' + window.igMasterTool.accountsData[accountId].followers.list.length);
						

						if(followers.page_info.end_cursor){
							window.igMasterTool.accountsData[accountId].followers.fetchInfo.endCursor = followers.page_info.end_cursor;
						}
						
						if(followers.page_info.has_next_page){
							window.igMasterTool.accountsData[accountId].followers.fetchInfo.hasNextPage = true;

							// TODO: Better way to show feedback to the user using the script:
							console.log('Fetching next followers page for account '+ window.igMasterTool.accountsData[accountId].username +'..')

							setTimeout(function(){
								window.igMasterTool.getFollowers(
									accountId,
									window.igMasterTool.accountsData[accountId].followers.fetchInfo.endCursor
								);
							}, 2000);
						} else {
							// if hasNextPage === true then still fetching
							window.igMasterTool.accountsData[accountId].followers.fetchInfo.hasNextPage = null;

							// Must reset endCursor so we are able to re-fetch followers from scratch:
							window.igMasterTool.accountsData[accountId].followers.fetchInfo.endCursor = null;

							// TODO: Better way to show feedback to the user using the script:
							console.log('Done fetching followers for account '+ window.igMasterTool.accountsData[accountId].username +'!!');
						}
					} catch(err){
						setTimeout(function(){
								window.igMasterTool.getFollowers(
									accountId,
									window.igMasterTool.accountsData[accountId].followers.fetchInfo.endCursor
								);
						}, 1000);

						// TODO: Better way to show feedback to the user using the script:
						console.log('Failed attempt..No worries..This is normal..Retrying..( Account '+ window.igMasterTool.accountsData[accountId].username +' )');
					}
			});
		});
	},
	getFollowing: function(accountId,after){
		const variables = '{"id":"'+accountId+'", "first": 50'+ (typeof after === "string" ? ', "after": "'+after+'"' : '') +'}';
		const url = this.getQueryUrl(this.queryHashes.getFollowing,variables);
		fetch(url).then(function(data){
		    const reader = data.body.getReader();
			reader.read().then(({value}) => {
					var result = new TextDecoder("utf-8").decode(value);
					try {
						const jsonResult = JSON.parse(result);
						const following = jsonResult.data.user.edge_follow;

						if( !(typeof window.igMasterTool.accountsData[accountId] === 'object') ){
							window.igMasterTool.addAccount(accountId);
						}
				
						window.igMasterTool.accountsData[accountId].following.list.push.apply(
							window.igMasterTool.accountsData[accountId].following.list,
							Array.from(following.edges)
						);

						// TODO: Better way to show feedback to the user using the script:
						console.log('Total accounts that '+ window.igMasterTool.accountsData[accountId].username +' follows collected so far: ' + window.igMasterTool.accountsData[accountId].following.list.length);
						

						if(following.page_info.end_cursor){
							window.igMasterTool.accountsData[accountId].following.fetchInfo.endCursor = following.page_info.end_cursor;
						}
						
						if(following.page_info.has_next_page){
							window.igMasterTool.accountsData[accountId].following.fetchInfo.hasNextPage = true;

							// TODO: Better way to show feedback to the user using the script:
							console.log('Fetching next page for the accounts the user ' + window.igMasterTool.accountsData[accountId].username + ' is following..')

							setTimeout(function(){
								window.igMasterTool.getFollowing(
									accountId,
									window.igMasterTool.accountsData[accountId].following.fetchInfo.endCursor
								);
							}, 2000);
						} else {
							// if hasNextPage === true then still fetching
							window.igMasterTool.accountsData[accountId].following.fetchInfo.hasNextPage = null;

							// Must reset endCursor so we are able to re-fetch following accs from scratch:
							window.igMasterTool.accountsData[accountId].following.fetchInfo.endCursor = null;

							// TODO: Better way to show feedback to the user using the script:
							console.log('Done fetching accounts that the user '+ window.igMasterTool.accountsData[accountId].username +' follows!!');
						}
					} catch(err){
						setTimeout(function(){
								window.igMasterTool.getFollowing(
									accountId,
									window.igMasterTool.accountsData[accountId].following.fetchInfo.endCursor
								);
						}, 1000);

						// TODO: Better way to show feedback to the user using the script:
						console.log('Failed attempt..No worries..This is normal..Retrying.. ( Account '+ accountId +' )');
					}
			});
		});
	},
	getUsersNotFollowingBack: function(accountId){
		var accountsNotFollowingBack = [];
		for(var x = 0; x < this.accountsData[accountId].following.list.length; x++){
			var userBeingFollowed = this.accountsData[accountId].following.list[x].node;
			var followsBack = false;
			for(var y = 0; y < this.accountsData[accountId].followers.list.length; y++){
				var userFollowingBack = this.accountsData[accountId].followers.list[y].node;
				if(userBeingFollowed.username === userFollowingBack.username){
					followsBack = true;
				}
			}

			if(false === followsBack){
				accountsNotFollowingBack.push(userBeingFollowed);
			}
		}
		this.accountsData[accountId].accountsNotFollowingBack = accountsNotFollowingBack;
	}
};
