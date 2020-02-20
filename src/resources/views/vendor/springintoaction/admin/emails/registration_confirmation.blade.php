<p>{{ $fullName }},</p>
<p>Thank you for helping with Spring Into Action!</p>
<p>You have been registered for the following project:</p>
<p>
{{ $SiteName }}<br>
{{ $ProjectDescription }}
</p>
<p>
@if(!empty($aTeamLeaders))
    {{ $leaderIntro }}<br>
    @foreach($aTeamLeaders as $teamLeader)
{{ $teamLeader['name'] }}<br>
{{ $teamLeader['email'] }}<br>
{{ $teamLeader['mobile'] }}<br>
{{ $teamLeader['home'] }}<br>
    @endforeach

@endif
</p>

