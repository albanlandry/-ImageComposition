<script>
    $(() => {
        const socket = io.connect('http://3.36.115.232:4000', { // ws:// 를 안쓰고 http를 쓴다
            path: '/socket.io', // 서버 path와 일치시켜준다
            transports: ['websocket']
        });


        $('#msg-send').click(() => {
            socket.emit('waitRoom-message', $('#message').val());
            $('#message').val('');
            return false;
        });

        $('.star_btn').click(() => {
            let roomName = $('#starwings').val();
            $('#select-room').val(roomName);
            socket.emit('req_join_room', roomName);
        })

        // $('.norri_btn').click(() => {
        //     let roomName = $('#norriGum').val();
        //     $('#select-room').val(roomName);
        //     socket.emit('req_join_room', roomName);
        // })
        //
        // $('.dmc_btn').click(() => {
        //     let roomName = $('#dmc').val();
        //     $('#select-room').val(roomName);
        //     socket.emit('req_join_room', roomName);
        // })

        $('#startwings_out').click(() => {
            let roomName = $('#starwings').val();
            $('#select-room').val('none');
            socket.emit('req_out_room', roomName);
        })

        $('#select-weapon-button').click(() => {
            let weapon = $('#select-weapon').val();
            socket.emit('req_select_weapon', weapon);
        });



        $('#room-msg-send').click(() => {
            socket.emit('req_room_message', $('#room-message').val());
            $('#room-message').val('');
            return false;
        });


        $('#user-send').click(()=>{
            let user_name = $('#user-name').val();
            socket.emit('req_user_name',user_name);
            return false;

        })

        $('#attack-send').click(() => {
            socket.emit('attack-damage', $('#attack-damage').val());
            $('#attack-damage').val('');
            return false;
        });

        socket.on('waitRoom-message', (res) => {
            $('#messages').prepend($('<li>').text(res));
        });

        socket.on('noti_join_room', (res,hp) => {
            $('#room-messages').prepend($('<li>').text(res));
            $('#monster-hp').show();
            $('#monster-hp').val(hp);
        });

        socket.on('noti_room_message', (res) => {
            $('#room-messages').prepend($('<li>').text(res));
        });

        socket.on('noti_out_message', (res,name) => {
            $('#room-messages').prepend($('<li>').text(name + ' 님이 ' + res + ' 를 나갔습니다'));
        });

        socket.on('noti_weapon_change', (weapon,name) => {
            $('#room-messages').prepend($('<li>').text(name + ' 님이 ' + weapon +' 무기를 착용했습니다'));
        });

        socket.on('noti_end_message', (res) => {
            $('#room-messages').prepend($('<li>').text(res));
        });

        socket.on('attack-damage', (name,weapon,hp) => {
            console.log('attack',hp);
            $('#room-messages').prepend($('<li>').text(name + ' 님이 ' + weapon + ' 공격 데미지'));
            const mhp = $('#monster-hp').val();
            $('#monster-hp').show();
            $('#monster-hp').val(hp);
        });

    });
</script>