$(document).ready(function () {
  $('#dtLinksTable').DataTable({
    "paging": true,
    "pagingType": "simple_numbers",
    "searching": true,
    "info": false
  });
  $('.dataTables_length').addClass('bs-select');
});