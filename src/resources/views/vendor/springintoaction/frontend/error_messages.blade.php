@if (isset($errors) && !empty($errors->all()))
<div class="row">
    <div class="col-xs-12">
        <div class="alert alert-danger" role="alert">
            <ul class="list-group list-group-flush">
                @foreach ($errors->all() as $key => $error)
                <li class="list-group-item list-group-item-danger" data-error-item="{{ $key }}">{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    </div>
</div>
@endif
