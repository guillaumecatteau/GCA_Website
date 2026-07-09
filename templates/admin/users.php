<div class="usersManagementContent" id="cntUSERSMANAGEMENT" style="display: none">
  <h2 class="title titleTop usersManagementTitle">
    <span>u</span><span>t</span><span>i</span><span>l</span><span>i</span><span>s</span><span>a</span>
    <span>t</span><span>e</span><span>u</span><span>r</span><span>s</span>
  </h2>
  <div class="basicGrid">
    <div class="mainBlock">
      <div class="entryListContainer" id="usersListContainer">
        <div class="entryBlock entryFilters" id="userEntryFilters">
          <div class="entryTop">
            <div class="entryUserInfosContainer">
              <div class="entryIdContainer"><span class="filtersTXT" id="userFilterId">ID</span></div>
              <div class="entrySeparatorContainer"><span class="entryTXT"> </span></div>
              <div class="entryNameContainer"><span class="filtersTXT" id="userFilterName">Name</span></div>
              <div class="entrySeparatorContainer"><span class="entryTXT"> </span></div>
              <div class="entryFirstNameContainer"><span class="filtersTXT" id="userFilterFirstname">Firstname</span></div>
              <div class="entrySeparatorContainer"><span class="entryTXT"> </span></div>
              <div class="entryMailContainer"><span class="filtersTXT" id="userFilteremail">email</span></div>
              <div class="entrySeparatorContainer"><span class="entryTXT"> </span></div>
              <div class="entrySubscriptionContainer"><span class="filtersTXT" id="subscription">subscription</span></div>
              <div class="entrySeparatorContainer"><span class="entryTXT"> </span></div>
              <div class="entryRoleContainer"><span class="filtersTXT" id="userFilterRole">Role</span></div>
            </div>
          </div>
        </div>
        <!-- Template d'entrée utilisateur (cloné par JS) -->
        <div class="entryBlock" id="userEntryTemplate" style="display: none;">
          <div class="entryTop">
            <div class="entryUserInfosContainer">
              <div class="entryIdContainer"><span class="entryTXT" id="userInfoID">#######</span></div>
              <div class="entrySeparatorContainer"><span class="entryTXT">-</span></div>
              <div class="entryNameContainer"><span class="entryTXTupper" id="userInfoName">Username</span></div>
              <div class="entrySeparatorContainer"><span class="entryTXT">-</span></div>
              <div class="entryFirstNameContainer"><span class="entryTXTupper" id="userInfoFirstname">UserFirstname</span></div>
              <div class="entrySeparatorContainer"><span class="entryTXT">-</span></div>
              <div class="entryMailContainer"><span class="entryTXT" id="userInfoMail">user@email.com</span></div>
              <div class="entrySeparatorContainer"><span class="entryTXT">-</span></div>
              <div class="entrySubscriptionContainer"><span class="entryTXT" id="userInfoSubscription">2025-01-01</span></div>
              <div class="entrySeparatorContainer"><span class="entryTXT">-</span></div>
              <div class="entryRoleContainer"><span class="entryTXTupper" id="userInfoRole">user</span></div>
            </div>
            <a class="btnEntrySettings" id="btnUserEntrySettings">
              <span class="icon iconSettings" id="btnEntrySettingsIcon"></span>
            </a>
          </div>
          <div class="entrySettingsBox">
            <form class="entryUserForm" action="" method="POST" id="formUpdateUser">
              <div class="formGroup"><input type="text" id="inputUpdateName" name="inputUpdateName" maxlength="50" placeholder="User name" /></div>
              <div class="formGroup"><input type="text" id="inputUpdateFirstName" name="inputUpdateFirstName" maxlength="50" placeholder="User firstname" /></div>
              <div class="formGroup"><input type="text" id="inputUpdateMail" name="inputUpdateMail" maxlength="254" placeholder="User email" /></div>
              <div class="formGroup">
                <label class="formLabel" for="inputUpdateRole">Role</label>
                <select id="inputUpdateRole" name="inputUpdateRole" class="formSelect">
                  <option value="user">User</option>
                  <option value="vip">VIP</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </form>
            <div class="entryBtnBox" id="boxUpdateUser">
              <div class="entryBtnBoxContent" id="entryBtnBoxContentUpdate">
                <div class="btnMedium" id="btnDeleteUser">
                  <div class="btnLabel"><span class="icon iconDelete"></span><span class="btnText" lang="FR" data-en="Delete">Supprimer</span></div>
                </div>
                <div class="btnMedium btnOff" id="btnSaveUser">
                  <div class="btnLabel"><span class="icon iconSave"></span><span class="btnText" lang="FR" data-en="Save">Sauvegarder</span></div>
                </div>
              </div>
              <div class="entryBtnBoxContent" id="entryBtnBoxContentUpdateComplete" style="display: none;">
                <span class="entryBtnBoxMessage" lang="FR" data-en="User updated">Utilisateur mis à jour</span>
              </div>
              <div class="entryBtnBoxContent" id="entryBtnBoxContentUpdateError" style="display: none;">
                <span class="entryBtnBoxMessage" lang="FR" data-en="An error has occured, try again !">Une erreur est survenue, réessayez !</span>
              </div>
              <div class="entryBtnBoxContent" id="entryBtnBoxContentDelete" style="display: none;">
                <span class="entryBtnBoxMessage" lang="FR" data-en="Permanently delete ?">Supprimer définitivement ?</span>
                <div class="btnMedium btnSmall" id="btnDeleteEntryDeny"><div class="btnLabel"><span class="icon iconDeny"></span></div></div>
                <div class="btnMedium btnSmall" id="btnDeleteEntryValidation"><div class="btnLabel"><span class="icon iconValid"></span></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="sideBlock">
      <div class="basicBlock" id="userSearchBlock">
        <span class="blockTitle" lang="FR" data-en="Search">Recherche<br>utilisateurs</span>
        <form class="formContainerLateral" action="" method="POST" id="formSearchUser">
          <div class="idSearchBox">
            <div class="formGroup"><label for="inputSearchUserIdA">From</label><input type="text" id="inputSearchUserIdA" name="inputSearchUserIdA" maxlength="10" placeholder="User ID" /></div>
            <div class="formGroup"><label for="inputSearchUserIdB">To</label><input type="text" id="inputSearchUserIdB" name="inputSearchUserIdB" maxlength="10" placeholder="User ID" /></div>
          </div>
          <div class="formGroup"><input type="text" id="inputSearchUserName" name="inputSearchUserName" maxlength="30" placeholder="User name" /></div>
          <div class="formGroup"><input type="text" id="inputSearchUserFirstname" name="inputSearchUserFirstname" maxlength="30" placeholder="User firstname" /></div>
          <div class="formGroup"><input type="text" id="inputSearchUserMail" name="inputSearchUserMail" maxlength="30" placeholder="User mail" /></div>
          <div class="formGroup"><input type="date" id="inputSearchUserSubscription" name="inputSearchUserSubscription" /></div>
          <div class="statusSearchBox">
            <div class="formGroup">
              <label class="formLabel" for="inputSearchRole">Role</label>
              <select id="inputSearchRole" name="inputSearchRole" class="formSelect">
                <option value="">Tous</option>
                <option value="user">User</option>
                <option value="vip">VIP</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="checkboxGroup"><input type="checkbox" id="inputSearchNewsletter" name="inputSearchNewsletter" /><label for="inputSearchNewsletter">Newsletter</label></div>
          </div>
        </form>
        <div class="lateralMessageBox">
          <div class="entryBtnBoxContent" id="entryBtnBoxSearchUser">
            <div class="btnMedium" id="btnUsersSearch"><div class="btnLabel"><span class="icon iconSearch"></span><span class="btnText" lang="FR" data-en="Search">Chercher</span></div></div>
          </div>
          <div class="entryBtnBoxContent" id="entryBtnBoxSearchUserComplete" style="display: none;"><span class="entryBtnBoxMessage" lang="FR" data-en="Search complete !">Recherche terminée !</span></div>
          <div class="entryBtnBoxContent" id="entryBtnBoxSearchUserNoResult" style="display: none;"><span class="entryBtnBoxMessage" lang="FR" data-en="No result...">Aucun résultat...</span></div>
          <div class="entryBtnBoxContent" id="entryBtnBoxSearchUserError" style="display: none;"><span class="entryBtnBoxMessage" lang="FR" data-en="Technical error. Try again !">Erreur technique. Reessayez !</span></div>
        </div>
      </div>
      <div class="basicBlock" id="uploadUsersBlock">
        <span class="blockTitle" lang="FR" data-en="Upload users">Upload<br>utilisateurs</span>
        <div class="lateralMessageBox">
          <div class="entryBtnBoxContent" id="entryBtnBoxUploadUserList">
            <div class="btnMedium" id="btnUploadUserList"><div class="btnLabel"><span class="icon iconUploadList"></span><span class="btnText" lang="FR" data-en="Upload">Uploader</span></div></div>
          </div>
          <div class="entryBtnBoxContent" id="entryBtnBoxUploadUserListComplete" style="display: none;"><span class="entryBtnBoxMessage" lang="FR" data-en="User list uploaded !">Liste utilisateurs uploadée !</span></div>
          <div class="entryBtnBoxContent" id="entryBtnBoxUploadUserError" style="display: none;"><span class="entryBtnBoxMessage" lang="FR" data-en="Technical error. Try again !">Erreur technique. Reessayez !</span></div>
          <div class="entryBtnBoxContent" id="entryBtnBoxUploadUserFormatError" style="display: none;"><span class="entryBtnBoxMessage" lang="FR" data-en="Entries are not in the right format !">Les entrées ne sont pas au bon format !</span></div>
        </div>
        <input type="file" id="inputUploadUserCSV" accept=".csv" style="display: none;" />
        <p class="blockSubTxt">Utilisez un doc formaté CSV</p>
      </div>
    </div>
  </div>
</div>
