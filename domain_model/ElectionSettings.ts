import { Race } from "./Race";
import { Uid } from "./Uid";

export interface ElectionSettings {
    once_per_ip?:	        boolean; //		only one ballot per ip address
    email_verification?:	boolean; //		requires voters to have verified emails to access ballots
    voter_authorization?:	boolean; //		only authorized voters may access ballots
    voter_ids?:	            boolean; //		sends voter id numbers to authorized voter emails, required to enter to access ballot
    two_factor_auth?:	    boolean; //		require two factor authentication to access ballot
    ballot_updates?:	    boolean; //		allows voters to update their ballots before election ends
    public_results?:	    boolean; //		allows public to view results
  }
