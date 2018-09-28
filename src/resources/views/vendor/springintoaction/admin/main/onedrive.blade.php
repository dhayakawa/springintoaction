@extends('boilerplate::layout.index', [
'title' => 'Spring Into Action',
'subtitle' => ''
])
@push('js')
@include('boilerplate::load.icheck')
@endpush

@push('css')
<link rel="stylesheet" href="{{ mix('/css/springintoaction.packages.css') }}"/>
<link rel="stylesheet" href="{{ mix('/css/springintoaction.app.css') }}"/>
<link rel="stylesheet" href="{{ mix('/css/springintoaction.onedrive.css') }}"/>
@endpush

@section('content')
<p>Quota remaining: {{ $bladeData['quotaRemaining'] }} Mbytes.</p>

<p><b>Create folder here:<br>

        <form method="post" action="createfolder.php">
            <input type="hidden" name="currentfolderid" value="{{ $bladeData['folderId'] }}">
            <input type="text" name="foldername" placeholder='Folder Name'>&nbsp;
            <input type="submit" name="submit" value='submit'>
        </form>

</p>

<p>
    <b>Upload folder here:<br>

        <form method="post" action="upload.php?folderid={{ $bladeData['folderId'] }}" enctype="multipart/form-data">
            <input type="hidden" name="folderid" value="{{ $bladeData['folderId'] }}">
            <input type="file" name="uploadfile" placeholder='Folder Name'>&nbsp;
            <input type="submit" name="submit" value='submit'>
        </form>
</p>;

@if (!empty($bladeData['properties']))
    <div id='bodyheader'>
        <b>{{ $bladeData['properties']['name'] }}</b><br>
        @if (!empty($bladeData['properties']['parent_id']))
        <a href="index.php?folderid={{ $bladeData['properties']['parent_id'] }}">Up to parent folder</a>";
        @endif
    </div>
    @endif

    @if (!empty($bladeData['response']))
    @foreach ($bladeData['response']['data'] as $item) {

    <div>
        @if ($item['type'] == 'folder' || $item['type'] == 'album') {
        <img src="statics/folder-icon.png" width="32px" style="vertical-align: middle;">&nbsp;
        <span style="vertical-align: middle;"><a title="Open folder" href="index.php?folderid={{ $item['id'] }}">{{ $item['name'] }}</a></span>
        @else:
        <img src="statics/{{ $item['type'] }}-icon.png" width="32px" style="vertical-align: middle;">&nbsp;
        <span style="vertical-align: middle;"><a title="Download" href="download.php?fileid={{ $item['id'] }}">{{ $item['name'] }}</a><br>
                        <a href="properties.php?fileid={{ $item['id'] }}">Properties</a></span>
        @endif

    </div>
    <br>
    @endforeach

    @if ($bladeData['response']['paging']['nextoffset'] != 0) {
    <a href="index.php?folderid={{ $bladeData['folderid'] }}&offset={{ $bladeData['response']['paging']['nextoffset'] }}">See More</a>
    @else:
    No more files in folder
    @endif
@endif
<br>
<a href="?logout=yes">Log Out</a>
@endsection
