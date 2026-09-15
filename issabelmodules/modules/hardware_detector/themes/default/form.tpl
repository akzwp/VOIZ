
<table width="100%" border="0" cellspacing="0" cellpadding="4" align="center">
    <tr class="letra12">
        {if $mode eq 'input'}
        <td align="left">
            <input class="button" type="submit" name="save_new" value="{$SAVE}">&nbsp;&nbsp;
            <input class="button" type="submit" name="cancel" value="{$CANCEL}">
        </td>
        {elseif $mode eq 'view'}
        <td align="left">
            <input class="button" type="submit" name="cancel" value="{$CANCEL}">
        </td>
        {elseif $mode eq 'edit'}
        <td align="left">
            <input class="button" type="submit" name="save_edit" value="{$EDIT}">&nbsp;&nbsp;
            <input class="button" type="submit" name="cancel" value="{$CANCEL}">
        </td>
        {/if}
        <td align="right" nowrap><span class="letra12"><span  class="required">*</span> {$REQUIRED_FIELD}</span></td>
    </tr>
</table>
<input type="hidden" name="idCard" value="{$DESC_ID}" />
<p id="port_desc">{$CARD} # {$ID}: {$TIPO} {$ADICIONAL}</p>
<table class="tabForm" width="100%">
        {foreach key=key item=echocancel name=arrPortsEchoInfo from=$arrPortsEcho}
        <tr class="letra12">
            <td><label for="typeecho_{$key}"><b>{$key}</b> {$echocancel.name_port}:</label></td>
            <td width="50%" align="left">
                <select id='typeecho_{$key}' name='typeecho_{$key}'>
                    {html_options options=$type_echo_names selected=$echocancel.type_echo}
                </select>
                <input type="hidden" value="{$echocancel.type_echo}" name="tmpTypeEcho{$key}" />
            </td>
        </tr>
        {/foreach}
</table>
<input class="button" type="hidden" name="id" value="{$ID}" />
