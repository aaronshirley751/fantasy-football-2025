#!/usr/bin/env python3
import json
import urllib.request
import sys

def count_transactions_by_roster():
    """Count free agent transactions by roster for 2025 league"""
    league_id = "1249067741470539776"
    url = f"https://api.sleeper.app/v1/league/{league_id}/transactions/1"
    
    try:
        with urllib.request.urlopen(url) as response:
            transactions = json.loads(response.read())
        
        # Count free agent transactions by roster
        roster_counts = {}
        commissioner_count = 0
        
        for transaction in transactions:
            if transaction['type'] == 'free_agent':
                roster_id = transaction['roster_ids'][0]
                roster_counts[roster_id] = roster_counts.get(roster_id, 0) + 1
            elif transaction['type'] == 'commissioner':
                commissioner_count += 1
        
        print("Pre-Season Transaction Analysis - 2025 League")
        print("=" * 50)
        print(f"Free Agent Transactions by Roster:")
        total_fa = 0
        for roster_id in sorted(roster_counts.keys()):
            count = roster_counts[roster_id]
            total_fa += count
            fees_owed = max(0, count - 10) * 2  # $2 per transaction after 10 free
            status = "✅ Under limit" if count <= 10 else f"💰 Owes ${fees_owed}"
            print(f"  Roster {roster_id}: {count} transactions - {status}")
        
        print(f"\nSummary:")
        print(f"  Total Free Agent Transactions: {total_fa}")
        print(f"  Commissioner Transactions: {commissioner_count}")
        print(f"  Total Transactions: {total_fa + commissioner_count}")
        
        # Calculate total fees owed
        total_fees = sum(max(0, count - 10) * 2 for count in roster_counts.values())
        if total_fees > 0:
            print(f"\n💰 Total Fees Owed: ${total_fees}")
        else:
            print(f"\n✅ No fees owed - all rosters within free transaction limits")
            
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(count_transactions_by_roster())
