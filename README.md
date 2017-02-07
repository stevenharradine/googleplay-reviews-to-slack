# googleplay-reviews-to-slack
Scrapes Google Plays reviews right off the site and posts them to slack.

## Requirements
 * Node

## Usage
Install npm packages
```
npm install
```

Run script
```
node server {{ google_play_app_id }} {{ slack_token }} "{{ slack_channel }}"
```
Where,
 * `google_play_app_id`: the google play id as found in the google play store (ie com.google.android.gm)
 * `slack_token`: and incoming webhook token provided by slack
 * `slack_channel`: the slack channel or person to send the data too, you must include the `#` or `@`
