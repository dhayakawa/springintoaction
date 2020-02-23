<html>
<head>
<!--[if mso]>
<style type=”text/css”>
    .fallback-text {
        font-family: sans-serif;
    }
</style>
<![endif]-->
<style type="text/css">
    @media screen {
        @font-face{
            font-family:'Open Sans';
            font-style:normal;
            font-weight:400;
            src:local('Open Sans'), local('OpenSans'), url('http://fonts.gstatic.com/s/opensans/v10/cJZKeOuBrn4kERxqtaUH3bO3LdcAZYWl9Si6vvxL-qU.woff') format('woff');
        }
        @font-face {
            font-family: 'Raleway';
            font-style: normal;
            font-weight: 100;
            src: local('Raleway Thin'), local('Raleway-Thin'), url(https://fonts.gstatic.com/s/raleway/v14/1Ptsg8zYS_SKggPNwE44TYFq.woff2) format('woff2');
            unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        @font-face {
            font-family: 'Raleway';
            font-style: normal;
            font-weight: 400;
            src: local('Raleway'), local('Raleway-Regular'), url(https://fonts.gstatic.com/s/raleway/v14/1Ptug8zYS_SKggPNyC0ITw.woff2) format('woff2');
            unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        @font-face {
            font-family: 'Raleway';
            font-style: normal;
            font-weight: 600;
            src: local('Raleway SemiBold'), local('Raleway-SemiBold'), url(https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwPIsWqZPAA.woff2) format('woff2');
            unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
    }

</style>
</head>
<body>
<div dir="ltr" class="fallback-text" style="color:black;font-size:16px;font-family:'open sans',sans-serif">
    <table cellpadding="0" cellspacing="0" border="0" height="200" width="100%">
        <tr>
            <td background="https://springintoaction.woodlandschurch.org/images/sia-grass.png" bgcolor="#7bceeb" valign="top" style="padding-left:50px;width:100%; height: 200px; background-image:url(https://springintoaction.woodlandschurch.org/images/sia-grass.png);background-position:center;background-repeat:no-repeat;background-size:cover;">
                <!--[if gte mso 9]>
                <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="mso-width-percent:1000;height:200px;">
                    <v:fill type="frame" src="https://springintoaction.woodlandschurch.org/images/sia-grass.png" color="#7bceeb" />
                    <v:textbox inset="0,0,0,0">
                <![endif]-->
                <table style="table-layout: fixed;width:100%;">
                    <tr>
                        <td valign="top" style="width:350px;">
                            <table style="table-layout: fixed;width:100%;">
                                <tr>
                                    <td valign="bottom" style="width:145px;">
                                        <img height="130" style="display:block;height:130px;" src="https://springintoaction.woodlandschurch.org/images/sia-spring-logo-transparent-big.png" />

                                    </td>
                                    <td valign="bottom" style="color:white;width:200px;font-size:28px;line-height:24px;font-weight:600;font-family:sans-serif;">
                                        <span style="">SPRING</span><br>
                                        <span style="">INTO</span><br>
                                        <span style="">ACTION</span>
                                    </td>
                                </tr>
                            </table>
                        </td>

                        <td rowspan="2" valign="middle" style="">
                            <div style="width:100%;text-align:center">
                                <h1 class="fallback-text" style="color:black;font-size:35px;font-weight:400;font-family:'Raleway','open sans',sans-serif;">Thank you for registering for<br>Spring into Action!</h1>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div style="font-size:34px;font-weight:bold;font-family:sans-serif;">{{ $date }}</div>
                        </td>
                    </tr>
                </table>
                <!--[if gte mso 9]>
                </v:textbox>
                </v:rect>
                <![endif]-->
            </td>
        </tr>
    </table>

    <p>Dear {{ $fullName }},</p>

    <p><em style="font-weight:bold">Welcome to the Spring into Action {{ $Year }} Team!</em> We are so excited to be serving our local school district with you. According to our database, you have signed up for the following school and project.</p>
    <div style="padding-left:20px;">
        <div style="font-weight:bold;font-size:22px;">
            {{ $SiteName }}
        </div>
        <div style="font-weight:normal;font-size:18px;">
            Project #{{ $SequenceNumber }} {{ $ProjectDescription }}
        </div>
    </div>
    <p>
        @if(!empty($aTeamLeaders))
        {{ $leaderIntro }}<br>
        @foreach($aTeamLeaders as $teamLeader)
    <div style="padding-left:20px;margin-bottom:10px;">
        {{ $teamLeader['name'] }}<br>
        <a target="_blank" href="mailto:{{ $teamLeader['email'] }}">{{ $teamLeader['email'] }}</a><br>
        {{ $teamLeader['mobile'] }}<br>
        {{ $teamLeader['home'] }}<br>
    </div>
        @endforeach

        @endif
    </p>
    <p>
    If you have any questions or if there is a problem with your registration, please contact us at <a href="mailto:sia@woodlandschurch.org" target="_blank">sia@woodlandschurch.org</a>. We will be contacting you again soon with more details!
    </p>
    <p>
        Sincerely,<br>
        <em style="font-weight:bold">The SIA Lead Team</em>
    </p>
</div>
</body>
</html>
