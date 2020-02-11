<p>Here is the latest report for {{ $SiteName }} project #{{ $ProjectNum }}.</p>

@if (count($aImages))
<p>Project attachments</p>
@endif

@if (isset($aImages['path']))
@foreach ($aImages['path'] as $src)
<p><img src="{{ $message->embed($src) }}"></p>
@endforeach
@endif

@if (isset($aImages['raw']))
@foreach ($aImages['raw'] as $src)
<p><img src="{{ $message->embedData($src['content'], $src['name']) }}"></p>
@endforeach
@endif

<p><em>This is an automatically generated email, please do not reply.</em></p>
