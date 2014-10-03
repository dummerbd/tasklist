tasksController = function() {
    var taskPage;
    var initialized = false;

    function errorLogger(errorCode, errorMessage) {
        console.log(errorCode + ': ' + errorMessage);
    }

    return {
        init: function(page, callback) {
            if (initialized) {
                callback();
            } else {
                storageEngine.init(function() {
                    storageEngine.initObjectStore('task', function() {
                        callback();
                    }, errorLogger);
                }, errorLogger);

                taskPage = $(page);

                taskPage.find('[required="required"]').prev('label').
                    append('<span>*</span>').children('span').addClass('required');

                taskPage.find('#btnAddTask').on('click', function(evt) {
                    evt.preventDefault();
                    $('#taskCreation').removeClass('not');
                });

                taskPage.find('#tblTasks tbody').on('click', 'tr', function(evt) {
                    var elem = $(evt.target)
                    if (elem) {
                        elem.siblings().andSelf().toggleClass('rowHighlight');
                    }
                });

                taskPage.find('#tblTasks tbody').on('click', '.deleteRow', function(evt) {
                    evt.preventDefault();
                    var target = $(this).closest('tr');
                    storageEngine.delete('task', target.find('.taskName').data().taskId, function() {
                        target.remove();
                    }, errorLogger);
                });

                taskPage.find('#saveTask').on('click', function(evt) {
                    evt.preventDefault();
                    if (taskPage.find('form').valid()) {
                        var task = $('form').toObject();
                        storageEngine.save('task', task, function(obj) {
                            var existingRow = taskPage.find('.taskName[data-task-id="'+obj.id+'"]');
                            if (existingRow) {
                                existingRow.closest('tr').remove();
                            }
                            $('#taskRow').tmpl(obj).appendTo($('#tblTasks tbody'));
                            taskPage.find('#taskCreation').addClass('not');
                            taskPage.find('#taskForm :input').val('');
                        }, errorLogger);
                    }
                });

                taskPage.find('#tblTasks tbody').on('click', '.editRow', function(evt) {
                    evt.preventDefault();
                    var target = $(this).closest('tr');
                    storageEngine.findByID('task', target.find('.taskName').data().taskId, function(obj) {
                        $('#taskForm').fromObject(obj);
                        $('#taskCreation').removeClass('not');
                    }, errorLogger);
                });

                initialized = true;
            }
        },

        loadTasks: function() {
            storageEngine.findAll('task', function(tasks) {
                $.each(tasks, function(i, task) {
                    $('#taskRow').tmpl(task).appendTo($('#taskPage').find('#tblTasks tbody'));
                });
            }, errorLogger);
        },
    }
}();
