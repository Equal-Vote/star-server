export interface ElectionSettings {
    election_roll_type:      string;  //   Type of voter roll of allowed voters (none, email, predefined voter_id)
    voter_id_type:	      string; //		Type of voter ID that will differentiate voters (none, IP address, email, predefined voter ID)
    email_verification?:	boolean; //		requires voters to have verified emails to access ballots
    two_factor_auth?:	    boolean; //		require two factor authentication to access ballot
    ballot_updates?:	    boolean; //		allows voters to update their ballots before election ends
    public_results?:	    boolean; //		allows public to view results
  }
