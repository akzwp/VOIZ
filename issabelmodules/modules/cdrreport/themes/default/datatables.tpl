

<script>
var cdrs = {$CDR};
var lang = "{$LANG}";
var DELMSG = "{$DELMSG}";
var module = "{$module_name}";
</script>

<script>
{$customJS}
</script>




</br>
<span id="msgFilter">
    {$FILTER_MSG}
</span>
</br>
</br>
<table id='CDRreport' class="table table-striped table-bordered table-hover" style="width:100%">
  <thead>
    <tr>
      <th>{$COLUMNS[0]}</th>
      <th>{$COLUMNS[1]}</th>
      <th>{$COLUMNS[2]}</th>
      <th>{$COLUMNS[3]}</th>
      <th>{$COLUMNS[4]}</th>
      <th>{$COLUMNS[5]}</th>
      <th>{$COLUMNS[6]}</th>
      <th>{$COLUMNS[7]}</th>
      <th>{$COLUMNS[8]}</th>
      <th>{$COLUMNS[9]}</th>
      <th>{$COLUMNS[15]}</th>
      <th>{$COLUMNS[14]}</th>
      <th>CEL</th>
  </tr>
  </thead>
  <tbody>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>
<div id="loader" class="center"></div>

<div class="chart-container" id=chart>
  <canvas id="myChart" height=220></canvas>
</div>

<div class="text-right">
  <button type="button" class="btn btn-link" id="download-pdf2" onclick="downloadPDF2()">
    <span class="glyphicon glyphicon-stats" aria-hidden="true"></span>
    PDF
  </button>
</div>

<div class='modal' id='gridModal' tabindex='-1' role='dialog'>
  <div class='modal-dialog {$modalClass}' role='document'>
    <div class='modal-content'>
      <div class='modal-header'>
        <h5 class='modal-title'>{#modalTitle#}</h5>
        <button type='button' class='close' data-dismiss='modal' aria-label='Close'>
          <span aria-hidden='true'>&times;</span>
        </button>
      </div>
      <div class='modal-body' id='gridModalContent'>
        {$modalContent}
      </div>
    </div>
  </div>
</div>
